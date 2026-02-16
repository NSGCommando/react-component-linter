import { useState } from 'react';
import "./App.css"

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenFile = async () => {
    setLoading(true);
    const filePath = await window.electronAPI.openFile();
    
    if (filePath) {
      const data = await window.electronAPI.lintFile(filePath);
      setResults(data);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h1>Linter Dashboard</h1>
      <button onClick={handleOpenFile} disabled={loading}>
        {loading ? 'Analyzing...' : 'Open & Lint JSX File'}
      </button>

      {results && (
        <div className= "file-details-container">
          <h2 className="file-path">File: {results.fileName}</h2>
          <p>Errors found: {results.errors.length}</p>
          {/*Display one item for each error object */}
          {results.errors.map((err, index) => (
            <div key={index} className={`error-card severity-${err.severity}`}>
                <div>
                    Line:{err.line},
                    Column:{err.column}
                </div>
              <div style={{ marginTop: '4px' }}>{err.message}</div>
              {/*Display the code snippets per item*/}
              {err.codeSnippet && (
                <pre className="code-snippet">
                {err.codeSnippet}
              </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;