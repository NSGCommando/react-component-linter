import "../styles/ResultTab.css"

function ResultTab({resultList, activeTab, setActiveTab}){
    if (resultList.length <= 1) return null;
    return(
        <div className="tab-bar">
        {resultList.map((result, index) => (
            <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? "tab active" : "tab"}
            >
            {result.fileName}
            </button>
        ))}
        </div>
    )
}

export default ResultTab;