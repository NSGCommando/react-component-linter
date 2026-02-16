import React, { useState } from 'react';

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <h1>Linter Dashboard</h1>
      <button onClick={handleOpenFile} disabled={loading}>
        {loading ? 'Analyzing...' : 'Open & Lint JSX File'}
      </button>

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h2>File: {results.fileName}</h2>
          <p>Errors found: {results.errors.length}</p>
          {results.errors.map((err, index) => (
            <div key={index} style={{ borderLeft: `4px solid ${err.severity === "error"?"#ff4d4d":"#ffae42"}`, 
                padding: '10px', margin: '10px 0', background: '#333' }}>
                <div>
                    Line:{err.line},
                    Column:{err.column}
                </div>
              <div style={{ marginTop: '4px' }}>{err.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;