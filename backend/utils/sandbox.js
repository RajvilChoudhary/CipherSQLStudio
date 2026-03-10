// backend/utils/sandbox.js
// THE HEART OF THE SANDBOX SYSTEM
// 
// How it works:
// - Each user session gets their own PostgreSQL SCHEMA (like a private folder)
// - When a user opens an assignment, we:
//   1. Create a schema named "workspace_<sessionId_short>"
//   2. Create the assignment's tables INSIDE that schema  
//   3. Insert the sample data rows
//   4. Run the user's query ONLY within that schema
//   5. After the query, we CLEAN UP the schema
//
// This ensures users can't see each other's work and can't accidentally 
// mess up the main database.

const { pool } = require('../config/postgres');

/**
 * Creates a safe schema name from a session ID
 * Schema names must be lowercase, no special chars except underscore
 */
const createSchemaName = (sessionId) => {
  // Take first 12 chars of sessionId, make safe
  const safe = sessionId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 12);
  return `workspace_${safe}`;
};

/**
 * Maps MongoDB dataType strings to proper PostgreSQL types
 */
const mapDataType = (dataType) => {
  const typeMap = {
    'INTEGER': 'INTEGER',
    'TEXT': 'TEXT',
    'REAL': 'REAL',
    'FLOAT': 'REAL',
    'BOOLEAN': 'BOOLEAN',
    'DATE': 'DATE',
    'TIMESTAMP': 'TIMESTAMP',
    'VARCHAR': 'VARCHAR(255)',
    'NUMERIC': 'NUMERIC',
    'BIGINT': 'BIGINT',
  };
  return typeMap[dataType.toUpperCase()] || 'TEXT';
};

/**
 * Sets up a sandboxed PostgreSQL schema for a given session + assignment
 * Creates the schema, tables, and inserts sample data
 */
const setupSandbox = async (sessionId, sampleTables) => {
  const schemaName = createSchemaName(sessionId);
  const client = await pool.connect(); // Get a connection from pool

  try {
    await client.query('BEGIN'); // Start a transaction

    // STEP 1: Drop schema if it already exists (clean slate)
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

    // STEP 2: Create fresh schema
    await client.query(`CREATE SCHEMA "${schemaName}"`);

    // STEP 3: Create each table and insert its data
    for (const table of sampleTables) {
      const { tableName, columns, rows } = table;

      // Build column definitions: "id INTEGER, name TEXT, salary REAL"
      const columnDefs = columns
        .map(col => `"${col.columnName}" ${mapDataType(col.dataType)}`)
        .join(', ');

      // Create the table
      await client.query(
        `CREATE TABLE "${schemaName}"."${tableName}" (${columnDefs})`
      );

      // Insert each row
      if (rows && rows.length > 0) {
        for (const row of rows) {
          const colNames = columns.map(col => `"${col.columnName}"`).join(', ');
          const values = columns.map(col => row[col.columnName]);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

          await client.query(
            `INSERT INTO "${schemaName}"."${tableName}" (${colNames}) VALUES (${placeholders})`,
            values
          );
        }
      }
    }

    await client.query('COMMIT'); // Save all changes
    return { schemaName, success: true };

  } catch (error) {
    await client.query('ROLLBACK'); // Undo everything if error
    throw new Error(`Sandbox setup failed: ${error.message}`);
  } finally {
    client.release(); // ALWAYS return connection to pool
  }
};

/**
 * Executes a user's SQL query within their sandboxed schema
 * Returns results or error message
 */
const executeQuery = async (sessionId, userQuery, sampleTables) => {
  const schemaName = createSchemaName(sessionId);
  const client = await pool.connect();

  try {
    // SAFETY CHECK: Block dangerous queries
    const dangerousPatterns = [
      /DROP\s+SCHEMA/i,
      /DROP\s+DATABASE/i,
      /CREATE\s+DATABASE/i,
      /ALTER\s+SYSTEM/i,
      /COPY\s+/i,
      /\\!/i,  // Shell commands
      /pg_sleep/i,
      /pg_read_file/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(userQuery)) {
        return { 
          success: false, 
          error: 'Query contains forbidden operations. You can only use SELECT, INSERT, UPDATE, DELETE on the provided tables.' 
        };
      }
    }

    // STEP 1: Set up sandbox with fresh data
    await setupSandbox(sessionId, sampleTables);

    // STEP 2: Set search_path so user can write "SELECT * FROM users" 
    // instead of "SELECT * FROM workspace_abc123.users"
    await client.query(`SET search_path TO "${schemaName}", public`);

    // STEP 3: Set a timeout so queries can't run forever (5 seconds max)
    await client.query(`SET statement_timeout = '5000'`);

    // STEP 4: Execute the user's query
    const startTime = Date.now();
    const result = await client.query(userQuery);
    const executionTime = Date.now() - startTime;

    // STEP 5: Clean up the schema after query
    await cleanupSandbox(sessionId);

    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields ? result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) : [],
      executionTime,
      command: result.command // SELECT, INSERT, UPDATE, DELETE
    };

  } catch (error) {
    // Clean up even on error
    await cleanupSandbox(sessionId).catch(() => {});
    
    return { 
      success: false, 
      error: error.message.replace(/\n/g, ' ') // Clean up error message
    };
  } finally {
    client.release();
  }
};

/**
 * Deletes the user's sandbox schema and all its tables
 */
const cleanupSandbox = async (sessionId) => {
  const schemaName = createSchemaName(sessionId);
  try {
    await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  } catch (err) {
    console.error('Sandbox cleanup error:', err.message);
  }
};

module.exports = { setupSandbox, executeQuery, cleanupSandbox };
