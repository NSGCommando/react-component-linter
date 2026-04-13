import { useState } from 'react';
import ResultTab from "./components/ResultTab"
import ErrorCard from './components/errorCard';
import "./styles/App.css"

function App() {
  const [resultList, setResultList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOpenFile = async () => {
    setLoading(true);
    const filePath = await window.electronAPI.openFile();
    
    if (filePath) {
      const data = await window.electronAPI.lintFile(filePath);
      setResultList(data);
      setActiveTab(0);
    }
    setLoading(false);
  };

  const activeResult = resultList?.[activeTab];

  return (
    <div className="dashboard-container">
      <h1>Linter Dashboard</h1>
      <button onClick={handleOpenFile} disabled={loading}>
        {loading ? 'Analyzing...' : 'Open & Lint JSX File'}
      </button>

      <div id="result-tab">
        <ResultTab resultList={resultList} activeTab={activeTab} setActiveTab={setActiveTab}/>
      </div>

      <div id="error-card">
        <ErrorCard activeResult={activeResult}/>
      </div>
    </div>
  );
}

export default App;