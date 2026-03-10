// frontend/src/components/editor/QueryResults.jsx
// Shows the results table after a query runs
// Also shows errors if query failed

const QueryResults = ({ result, isLoading }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="results-area__empty">
        <div className="loading-dots">
          <span /><span /><span />
        </div>
        <p>Executing query in sandbox...</p>
      </div>
    );
  }

  // Empty state (no query run yet)
  if (!result) {
    return (
      <div className="results-area__empty">
        <div className="empty-icon">⬡</div>
        <p>Results will appear here</p>
        <p style={{ marginTop: '4px', opacity: 0.5 }}>Write a query above and click Run</p>
      </div>
    );
  }

  // Error state
  if (!result.success) {
    return (
      <div className="query-error">
        <div className="query-error__title">⚠ Query Error</div>
        <div className="query-error__message">{result.error}</div>
      </div>
    );
  }

  // Success - but no rows returned (e.g., INSERT, UPDATE)
  if (result.rows?.length === 0) {
    return (
      <div className="query-success">
        ✓ Query executed successfully — {result.command} returned 0 rows
        {result.executionTime && ` (${result.executionTime}ms)`}
      </div>
    );
  }

  // Success with results
  return (
    <div className="results-area__scroll">
      <div className="results-table">
        {/* Meta info bar */}
        <div className="results-table__meta">
          <span>
            <span className="results-table__count">{result.rowCount}</span>
            {' '}row{result.rowCount !== 1 ? 's' : ''} returned
          </span>
          {result.executionTime !== undefined && (
            <span className="results-table__time">
              {result.executionTime}ms
            </span>
          )}
        </div>

        {/* Data table */}
        <table>
          <thead>
            <tr>
              {result.fields?.map(field => (
                <th key={field.name}>{field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {result.fields?.map(field => (
                  <td 
                    key={field.name}
                    className={row[field.name] === null ? 'null-value' : ''}
                  >
                    {row[field.name] === null 
                      ? 'NULL' 
                      : String(row[field.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryResults;
