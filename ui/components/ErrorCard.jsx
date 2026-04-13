import "../styles/ErrorCard.css"

function ErrorCard({activeResult}){
    if (!activeResult) return null;
    return(
        <div className= "file-details-container">
        <h2 className="file-path">File: {activeResult.fileName}</h2>
        <p>Errors found: {activeResult.errors.length}</p>
        {/*Display one item for each error object */}
        {activeResult.errors.map((err, index) => (
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
    )
}

export default ErrorCard;