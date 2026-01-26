function ModelCard({ response, modelName, loading }) {
  const copyToClipboard = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      alert('Response copied to clipboard!');
    }
  };

  return (
    <div className="model-card">
      <div className="model-card-header">
        <h3>{modelName || 'No Model Selected'}</h3>
        {response?.success && (
          <button 
            className="copy-btn" 
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            📋
          </button>
        )}
      </div>
      
      <div className="model-card-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating response...</p>
          </div>
        ) : response ? (
          <>
            {response.success ? (
              <>
                <div className="response-text">{response.content}</div>
                <div className="response-meta">
                  {response.responseTime && (
                    <span>⏱️ {response.responseTime}ms</span>
                  )}
                  {response.tokens && (
                    <span>🎫 {response.tokens} tokens</span>
                  )}
                </div>
              </>
            ) : (
              <div className="error">
                <p>❌ Error: {response.error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="placeholder">
            <p>Response will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelCard;
