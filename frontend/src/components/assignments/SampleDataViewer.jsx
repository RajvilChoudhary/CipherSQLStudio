// frontend/src/components/assignments/SampleDataViewer.jsx
// Shows the tables and their data for the current assignment
// Students need this to understand what data they're querying

const SampleDataViewer = ({ sampleTables }) => {
  if (!sampleTables || sampleTables.length === 0) {
    return (
      <div className="data-panel">
        <p className="data-panel__title">Sample Data</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          No sample data available
        </p>
      </div>
    );
  }

  return (
    <div className="data-panel">
      <p className="data-panel__title">Sample Data</p>

      {sampleTables.map((table) => (
        <div key={table.tableName} className="table-block">
          <div className="table-block__header">
            <span className="table-name">{table.tableName}</span>
            <span className="row-count">{table.rows?.length || 0} rows</span>
          </div>

          <div className="table-block__content">
            {/* Show schema (column names + types) */}
            <table className="results-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  {table.columns.map(col => (
                    <th key={col.columnName}>
                      {col.columnName}
                      <br />
                      <span style={{ 
                        color: 'var(--color-primary)', 
                        fontSize: '0.65rem',
                        fontWeight: 400,
                        opacity: 0.8
                      }}>
                        {col.dataType}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Show first 5 rows max */}
                {table.rows?.slice(0, 5).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {table.columns.map(col => (
                      <td key={col.columnName}>
                        {row[col.columnName] === null || row[col.columnName] === undefined
                          ? <span className="null-value">NULL</span>
                          : String(row[col.columnName])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Show "X more rows" if table has more than 5 */}
            {table.rows?.length > 5 && (
              <div style={{ 
                padding: '8px 12px', 
                fontSize: '0.7rem', 
                color: 'var(--color-text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                borderTop: '1px solid var(--color-border)'
              }}>
                ... and {table.rows.length - 5} more rows (all loaded in sandbox)
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleDataViewer;
