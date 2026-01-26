import { useState, useEffect } from 'react';
import { getAvailableModels, compareModels } from './services/api';
import { Menu, X, MessageSquare, User, Settings, Key, Plus, Trash2, Clock, Edit2, CreditCard, LogOut, BarChart3, Send, Paperclip } from 'lucide-react';

function App() {
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState(['', '', '', '']);
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('settings');
  const [showModelDropdown, setShowModelDropdown] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = (index, modelId) => {
    const newModels = [...selectedModels];
    newModels[index] = modelId;
    setSelectedModels(newModels);
    setShowModelDropdown(null);
  };

  const handleCompare = async () => {
    const activeModels = selectedModels.filter(m => m !== '');
    
    if (activeModels.length === 0) {
      alert('Please select at least one model');
      return;
    }

    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResponses([null, null, null, null]);

    try {
      const results = await compareModels(prompt, activeModels);
      const newResponses = selectedModels.map(modelId => {
        if (!modelId) return null;
        return results.find(r => r.modelId === modelId) || null;
      });
      setResponses(newResponses);
    } catch (error) {
      console.error('Comparison failed:', error);
      alert('Failed to compare models. Please check your API keys and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPanel = () => {
    if (selectedModels.filter(m => m === '').length > 0) return;
    setSelectedModels([...selectedModels, '']);
    setResponses([...responses, null]);
  };

  const removePanel = () => {
    if (selectedModels.length <= 1) return;
    setSelectedModels(selectedModels.slice(0, -1));
    setResponses(responses.slice(0, -1));
  };

  const ModelCard = ({ panel, index }) => {
    const model = availableModels.find(m => m.id === selectedModels[index]);
    const response = responses[index];
    const isLoading = loading && selectedModels[index];

    return (
      <div className="model-card">
        <div className="model-selector-header">
          <button
            onClick={() => setShowModelDropdown(showModelDropdown === index ? null : index)}
            className="model-button"
          >
            <span className="model-icon">{model?.name.includes('Claude') ? '🔷' : model?.name.includes('GPT') ? '🤖' : model?.name.includes('Gemini') ? '✨' : '💼'}</span>
            <span className="model-name">{model ? model.name : 'Select Model'}</span>
            <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showModelDropdown === index && (
            <div className="model-dropdown">
              {availableModels.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(index, m.id)}
                  className={`model-dropdown-item ${selectedModels[index] === m.id ? 'active' : ''}`}
                >
                  <span className="model-icon">{m.name.includes('Claude') ? '🔷' : m.name.includes('GPT') ? '🤖' : m.name.includes('Gemini') ? '✨' : '💼'}</span>
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="model-card-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Generating response...</p>
              <p className="loading-subtext">Please wait</p>
            </div>
          ) : response && response.success ? (
            <div className="response-content">
              <div className="response-text">{response.content}</div>
            </div>
          ) : response && !response.success ? (
            <div className="error-state">
              <p>❌ Error: {response.error}</p>
            </div>
          ) : (
            <div className="placeholder-state">
              <div className="placeholder-icon">
                <MessageSquare size={32} />
              </div>
              <h3 className="placeholder-title">{model ? 'Ready to assist' : 'Select a model'}</h3>
              <p className="placeholder-text">{model ? 'Type your message below to get started' : 'Choose an AI model from the dropdown above'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>

        <div className="sidebar-header">
          <h2>LLM Compare</h2>
          <p>AI Model Comparison Tool</p>
        </div>

        <div className="sidebar-tabs">
          <button onClick={() => setSidebarTab('chats')} className={`sidebar-tab ${sidebarTab === 'chats' ? 'active' : ''}`}>
            <MessageSquare size={20} /> Chat History
          </button>
          <button onClick={() => setSidebarTab('account')} className={`sidebar-tab ${sidebarTab === 'account' ? 'active' : ''}`}>
            <User size={20} /> Account
          </button>
          <button onClick={() => setSidebarTab('settings')} className={`sidebar-tab ${sidebarTab === 'settings' ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </button>
        </div>

        <div className="sidebar-content">
          {sidebarTab === 'settings' && (
            <div className="settings-section">
              <div className="settings-group">
                <div className="settings-group-header">
                  <Key size={16} />
                  <h3>API Configuration</h3>
                </div>
                <div className="api-config-list">
                  {availableModels.map(model => (
                    <div key={model.id} className="api-config-item">
                      <div className="api-config-header">
                        <div className="api-config-name">
                          <span className="api-icon">{model.name.includes('Claude') ? '🔷' : model.name.includes('GPT') ? '🤖' : model.name.includes('Gemini') ? '✨' : '💼'}</span>
                          <span>{model.name}</span>
                        </div>
                        <button className="config-button">Configure</button>
                      </div>
                      <div className="api-config-status">
                        <div className="status-dot"></div>
                        <span>Not configured</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <h3>Preferences</h3>
                <div className="preference-list">
                  <label className="preference-item">
                    <span>Dark Mode</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="preference-item">
                    <span>Auto-save Conversations</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="preference-item">
                    <span>Show Response Time</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'account' && (
            <div className="account-section">
              <div className="user-profile">
                <div className="user-avatar">
                  <User size={28} />
                </div>
                <div className="user-info">
                  <h3>John Doe</h3>
                  <p>Pro Account</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="app">
      <Sidebar />
      
      <header className="app-header">
        <div className="header-left">
          <button className="menu-button" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>AI Model Comparison</h1>
            <p>Compare responses across different LLMs</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <span>John Doe</span>
            <span className="user-badge">Pro Account</span>
            <button className="user-avatar-btn">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className={`comparison-grid ${viewMode}`}>
          {viewMode === 'grid' ? (
            selectedModels.map((_, index) => (
              <ModelCard key={index} index={index} />
            ))
          ) : (
            <ModelCard index={carouselIndex} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="input-container">
          <div className="panel-controls">
            <button onClick={removePanel} className="control-btn" disabled={selectedModels.length <= 1}>−</button>
            <button onClick={addPanel} className="control-btn" disabled={selectedModels.length >= 4}>+</button>
          </div>
          
          <div className="input-wrapper">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCompare()}
              placeholder="Type your message to compare across models..."
              disabled={loading}
              className="message-input"
            />
            <button className="attach-button">
              <Paperclip size={20} />
            </button>
            <button onClick={handleCompare} disabled={loading} className="send-button">
              <Send size={20} />
            </button>
          </div>

          <div className="view-controls">
            <button onClick={() => setViewMode('carousel')} className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}>
              Carousel
            </button>
            <button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}>
              Grid
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
