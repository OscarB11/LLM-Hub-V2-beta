import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAvailableModels, compareModels } from './services/api';
import { Menu, X, MessageSquare, Send, Paperclip, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Copy, Check } from 'lucide-react';

const DEFAULT_CONFIG = {
  temperature: 1,
  maxTokens: 65536,
  topP: 0.95,
  systemPrompt: '',
  thinkingLevel: 'auto',
  groundingEnabled: false
};

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
  const [darkMode, setDarkMode] = useState(true);
  const [showResponseTime, setShowResponseTime] = useState(false);
  const [debugLogging, setDebugLogging] = useState(true);
  const [modelConfigs, setModelConfigs] = useState({});
  const [sidebarConfigModel, setSidebarConfigModel] = useState(null);
  const [customModels, setCustomModels] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customModels') || '[]'); } catch { return []; }
  });
  const [customModelModal, setCustomModelModal] = useState(null);

  useEffect(() => {
    localStorage.setItem('customModels', JSON.stringify(customModels));
  }, [customModels]);

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
    const activeSlots = selectedModels
      .map((id, i) => ({ slotIndex: i, modelId: id }))
      .filter(s => s.modelId !== '');

    if (activeSlots.length === 0) {
      alert('Please select at least one model');
      return;
    }
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResponses(Array(selectedModels.length).fill(null));

    try {
      const resolvedModelIds = activeSlots.map(s => {
        const custom = customModels.find(c => c.id === s.modelId);
        return custom ? custom.baseModelId : s.modelId;
      });
      const activeConfigs = activeSlots.map(s => {
        const custom = customModels.find(c => c.id === s.modelId);
        return custom ? custom.config : (modelConfigs[s.modelId] || { ...DEFAULT_CONFIG });
      });
      const results = await compareModels(prompt, resolvedModelIds, activeConfigs, debugLogging);
      const newResponses = Array(selectedModels.length).fill(null);
      activeSlots.forEach((slot, i) => { newResponses[slot.slotIndex] = results[i] || null; });
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

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + selectedModels.length) % selectedModels.length);
  };

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % selectedModels.length);
  };

  const getModelIcon = (model) => {
    if (!model) return '💼';
    const p = model.provider || '';
    if (p === 'openai' || model.name?.includes('GPT')) return '🤖';
    if (p === 'gemini' || model.name?.includes('Gemini')) return '✨';
    if (p === 'anthropic' || model.name?.includes('Claude')) return '🔷';
    return '💼';
  };

  const groupedModels = availableModels.reduce((acc, m) => {
    const company =
      m.provider === 'openai' ? 'OpenAI' :
      m.provider === 'gemini' ? 'Google' :
      m.provider === 'anthropic' ? 'Anthropic' :
      'Other';
    if (!acc[company]) acc[company] = [];
    acc[company].push(m);
    return acc;
  }, {});

  const groupedDropdownModels = {
    ...groupedModels,
    ...(customModels.length > 0 ? {
      'Custom': customModels.map(cm => {
        const base = availableModels.find(m => m.id === cm.baseModelId);
        return { id: cm.id, name: cm.name, provider: base?.provider || 'custom', contextWindow: base?.contextWindow, _isCustom: true };
      })
    } : {})
  };

  const getModelInfo = (modelId) => {
    const custom = customModels.find(c => c.id === modelId);
    if (custom) {
      const base = availableModels.find(m => m.id === custom.baseModelId);
      return { ...(base || {}), id: custom.id, name: custom.name, _isCustom: true };
    }
    return availableModels.find(m => m.id === modelId);
  };

  const formatContextWindow = (tokens) => {
    if (!tokens) return null;
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const updateModelConfig = (modelId, config) => {
    setModelConfigs(prev => ({ ...prev, [modelId]: config }));
  };

  const CustomModelModal = ({ editModel, onClose }) => {
    const [name, setName] = useState(editModel?.name || '');
    const [baseModelId, setBaseModelId] = useState(editModel?.baseModelId || '');
    const [local, setLocal] = useState(editModel?.config ? { ...editModel.config } : { ...DEFAULT_CONFIG });
    const upd = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));
    const baseModel = availableModels.find(m => m.id === baseModelId);
    const save = () => {
      if (!name.trim()) return alert('Please enter a display name.');
      if (!baseModelId) return alert('Please select a base model.');
      if (editModel) {
        setCustomModels(prev => prev.map(cm => cm.id === editModel.id ? { ...cm, name: name.trim(), baseModelId, config: local } : cm));
      } else {
        setCustomModels(prev => [...prev, { id: `custom-${Date.now()}`, name: name.trim(), baseModelId, config: local }]);
      }
      onClose();
    };
    return (
      <>
        <div className="config-modal-overlay" onClick={onClose} />
        <div className="config-modal">
          <div className="config-modal-header">
            <div>
              <h3>{editModel ? 'Edit Custom Model' : 'New Custom Model'}</h3>
              <span className="config-modal-model-name">Bundle a base model with custom settings</span>
            </div>
            <button className="config-modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="config-modal-body">
            <div className="config-field">
              <label>Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Fast Gemini" className="config-text-input" />
            </div>
            <div className="config-field">
              <label>Base Model</label>
              <select value={baseModelId} onChange={(e) => setBaseModelId(e.target.value)} className="config-select">
                <option value="">Select a base model...</option>
                {Object.entries(groupedModels).map(([company, models]) => (
                  <optgroup key={company} label={company}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="config-field">
              <div className="config-field-header"><label>Temperature</label><span className="config-value-badge">{local.temperature.toFixed(2)}</span></div>
              <input type="range" min="0" max="2" step="0.01" value={local.temperature} onChange={(e) => upd('temperature', parseFloat(e.target.value))} className="config-slider" />
              <div className="config-slider-labels"><span>Precise (0)</span><span>Creative (2)</span></div>
            </div>
            <div className="config-field">
              <div className="config-field-header"><label>Max Tokens</label><span className="config-value-badge">{local.maxTokens.toLocaleString()}</span></div>
              <input type="range" min="64" max="65536" step="256" value={local.maxTokens} onChange={(e) => upd('maxTokens', parseInt(e.target.value))} className="config-slider" />
              <div className="config-slider-labels"><span>64</span><span>65,536</span></div>
            </div>
            <div className="config-field">
              <div className="config-field-header"><label>Top P</label><span className="config-value-badge">{local.topP.toFixed(2)}</span></div>
              <input type="range" min="0" max="1" step="0.01" value={local.topP} onChange={(e) => upd('topP', parseFloat(e.target.value))} className="config-slider" />
              <div className="config-slider-labels"><span>0</span><span>1</span></div>
            </div>
            <div className="config-field">
              <label>System Prompt</label>
              <textarea value={local.systemPrompt} onChange={(e) => upd('systemPrompt', e.target.value)}
                placeholder="Optional system instructions..." className="config-system-prompt" rows={3} />
            </div>
            {baseModel?.provider === 'gemini' && (
              <div className="config-field">
                <div className="config-field-header">
                  <label>Thinking Level</label>
                  <span className="config-value-badge">{local.thinkingLevel}</span>
                </div>
                <div className="config-thinking-options">
                  {['auto', 'none', 'low', 'medium', 'high'].map(level => (
                    <button key={level} className={`config-thinking-btn${local.thinkingLevel === level ? ' active' : ''}`} onClick={() => upd('thinkingLevel', level)}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {baseModel?.provider === 'gemini' && (
              <div className="config-field">
                <div className="config-field-header">
                  <label>Grounding with Google Search</label>
                  <label className="config-toggle">
                    <input type="checkbox" checked={local.groundingEnabled} onChange={(e) => upd('groundingEnabled', e.target.checked)} />
                    <span className="config-toggle-track" />
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="config-modal-footer">
            <button className="config-reset-btn" onClick={() => setLocal({ ...DEFAULT_CONFIG })}>Reset</button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="config-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="config-save-btn" onClick={save}>{editModel ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const ModelConfigModal = ({ modelId, onClose }) => {
    const model = availableModels.find(m => m.id === modelId);
    const config = modelConfigs[modelId] || DEFAULT_CONFIG;
    const [local, setLocal] = useState({ ...config });
    const upd = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));
    const save = () => { updateModelConfig(modelId, local); onClose(); };
    return (
      <>
        <div className="config-modal-overlay" onClick={onClose} />
        <div className="config-modal">
          <div className="config-modal-header">
            <div>
              <h3>Configure Model</h3>
              <span className="config-modal-model-name">{model?.name || 'No model selected'}</span>
            </div>
            <button className="config-modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="config-modal-body">
            <div className="config-field">
              <div className="config-field-header">
                <label>Temperature</label>
                <span className="config-value-badge">{local.temperature.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="2" step="0.01"
                value={local.temperature}
                onChange={(e) => upd('temperature', parseFloat(e.target.value))}
                className="config-slider"
              />
              <div className="config-slider-labels"><span>Precise (0)</span><span>Creative (2)</span></div>
            </div>
            <div className="config-field">
              <div className="config-field-header">
                <label>Max Tokens</label>
                <span className="config-value-badge">{local.maxTokens.toLocaleString()}</span>
              </div>
              <input type="range" min="64" max="65536" step="256"
                value={local.maxTokens}
                onChange={(e) => upd('maxTokens', parseInt(e.target.value))}
                className="config-slider"
              />
              <div className="config-slider-labels"><span>64</span><span>65,536</span></div>
            </div>
            <div className="config-field">
              <div className="config-field-header">
                <label>Top P</label>
                <span className="config-value-badge">{local.topP.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.01"
                value={local.topP}
                onChange={(e) => upd('topP', parseFloat(e.target.value))}
                className="config-slider"
              />
              <div className="config-slider-labels"><span>0</span><span>1</span></div>
            </div>
            <div className="config-field">
              <label>System Prompt</label>
              <textarea
                value={local.systemPrompt}
                onChange={(e) => upd('systemPrompt', e.target.value)}
                placeholder="Optional system instructions for the model..."
                className="config-system-prompt"
                rows={3}
              />
            </div>
            {model?.provider === 'gemini' && (
              <div className="config-field">
                <div className="config-field-header">
                  <label>Thinking Level</label>
                  <span className="config-value-badge">{local.thinkingLevel}</span>
                </div>
                <div className="config-thinking-options">
                  {['auto', 'none', 'low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      className={`config-thinking-btn${local.thinkingLevel === level ? ' active' : ''}`}
                      onClick={() => upd('thinkingLevel', level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="config-field-hint">
                  {local.thinkingLevel === 'auto' && 'Model chooses thinking depth automatically.'}
                  {local.thinkingLevel === 'none' && 'Thinking disabled — fastest responses.'}
                  {local.thinkingLevel === 'low' && 'Minimal thinking — fast, lower latency.'}
                  {local.thinkingLevel === 'medium' && 'Balanced thinking and speed.'}
                  {local.thinkingLevel === 'high' && 'Deep reasoning — best for complex tasks.'}
                </p>
              </div>
            )}
            {model?.provider === 'gemini' && (
              <div className="config-field">
                <div className="config-field-header">
                  <label>Grounding with Google Search</label>
                  <label className="config-toggle">
                    <input
                      type="checkbox"
                      checked={local.groundingEnabled}
                      onChange={(e) => upd('groundingEnabled', e.target.checked)}
                    />
                    <span className="config-toggle-track" />
                  </label>
                </div>
                <p className="config-field-hint">
                  {local.groundingEnabled
                    ? 'Model will search the web for real-time info and cite sources.'
                    : 'Enable to ground responses in live Google Search results.'}
                </p>
              </div>
            )}
          </div>
          <div className="config-modal-footer">
            <button className="config-reset-btn" onClick={() => setLocal({ ...DEFAULT_CONFIG })}>Reset</button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="config-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="config-save-btn" onClick={save}>Apply</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const ModelCard = ({ panel, index }) => {
    const model = getModelInfo(selectedModels[index]);
    const response = responses[index];
    const isLoading = loading && selectedModels[index];
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      if (response?.content) {
        navigator.clipboard.writeText(response.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="model-card">
        <div className="model-selector-header">
          <div className="model-header-top">
            <div className="model-header-row">
              <button
                onClick={() => setShowModelDropdown(showModelDropdown === index ? null : index)}
                className="model-button"
              >
                <span className="model-name">{model ? model.name : 'Select Model'}</span>
                <svg className="dropdown-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {model?.contextWindow && (
                <div className="context-badge">
                  <span className="context-badge-label">Context</span>
                  <span className="context-badge-value">{formatContextWindow(model.contextWindow)}</span>
                </div>
              )}
            </div>
            {response?.success && (
              <button
                className={`copy-btn${copied ? ' copied' : ''}`}
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy response'}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {showModelDropdown === index && (
            <div className="model-dropdown">
              {Object.entries(groupedDropdownModels).map(([company, models]) => (
                <div key={company} className="model-dropdown-group">
                  <div className={`model-dropdown-group-label${company === 'Custom' ? ' custom-group-label' : ''}`}>{company}</div>
                  {models.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleModelChange(index, m.id)}
                      className={`model-dropdown-item ${selectedModels[index] === m.id ? 'active' : ''}${m._isCustom ? ' custom-item' : ''}`}
                    >
                      <span className="dropdown-item-name">{m.name}</span>
                      {m._isCustom ? (
                        <span className="dropdown-item-custom-badge">custom</span>
                      ) : m.contextWindow && (
                        <span className="dropdown-item-context">{formatContextWindow(m.contextWindow)}</span>
                      )}
                    </button>
                  ))}
                </div>
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
              <div className="response-stats">
                {showResponseTime && response.responseTime != null && (
                  <div className="stat-chip">
                    <span className="stat-label">⏱ Time</span>
                    <span className="stat-value">{(response.responseTime / 1000).toFixed(2)}s</span>
                  </div>
                )}
                {response.tokens?.input != null && (
                  <div className="stat-chip">
                    <span className="stat-label">↑ In</span>
                    <span className="stat-value">{response.tokens.input.toLocaleString()}</span>
                  </div>
                )}
                {response.tokens?.output != null && (
                  <div className="stat-chip">
                    <span className="stat-label">↓ Out</span>
                    <span className="stat-value">{response.tokens.output.toLocaleString()}</span>
                  </div>
                )}
                {model?.contextWindow && (
                  <div className="stat-chip">
                    <span className="stat-label">⬚ Context</span>
                    <span className="stat-value">{formatContextWindow(model.contextWindow)}</span>
                  </div>
                )}
              </div>
              {response.groundingSources?.length > 0 && (
                <div className="grounding-sources">
                  <div className="grounding-sources-label">🔍 Sources</div>
                  {response.groundingSources.map((src, i) => (
                    <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="grounding-source-item">
                      <span className="grounding-source-index">{i + 1}</span>
                      <span className="grounding-source-title">{src.title}</span>
                    </a>
                  ))}
                </div>
              )}
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
          <button onClick={() => setSidebarTab('settings')} className={`sidebar-tab ${sidebarTab === 'settings' ? 'active' : ''}`}>
            Settings
          </button>
          <button onClick={() => setSidebarTab('custom')} className={`sidebar-tab ${sidebarTab === 'custom' ? 'active' : ''}`}>
            Custom
          </button>
        </div>

        <div className="sidebar-content">
          {sidebarTab === 'custom' && (
            <div className="settings-section">
              <div className="settings-group">
                <div className="settings-group-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>Custom Models</h3>
                  <button className="custom-model-add-btn" onClick={() => setCustomModelModal({ mode: 'create' })}>
                    <Plus size={13} /> New
                  </button>
                </div>
                {customModels.length === 0 ? (
                  <div className="custom-models-empty">
                    <p>No custom models yet.</p>
                    <p>Create a preset that bundles a base model with your own name and settings — it will appear in the model selector.</p>
                  </div>
                ) : (
                  <div className="custom-models-list">
                    {customModels.map(cm => {
                      const base = availableModels.find(m => m.id === cm.baseModelId);
                      return (
                        <div key={cm.id} className="custom-model-item">
                          <div className="custom-model-info">
                            <span className="custom-model-name">{cm.name}</span>
                            <span className="custom-model-base">{base?.name || cm.baseModelId}</span>
                          </div>
                          <div className="custom-model-actions">
                            <button className="custom-model-btn" title="Edit" onClick={() => setCustomModelModal({ mode: 'edit', model: cm })}>
                              <Pencil size={13} />
                            </button>
                            <button className="custom-model-btn danger" title="Delete" onClick={() => setCustomModels(prev => prev.filter(c => c.id !== cm.id))}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {sidebarTab === 'settings' && (
            <div className="settings-section">
              <div className="settings-group">
                <div className="settings-group-header">
                  <h3>API Configuration</h3>
                </div>
                <div className="api-config-list">
                  {Object.entries(groupedModels).map(([company, models]) => (
                    <div key={company}>
                      <div className="model-dropdown-group-label">{company}</div>
                      {models.map(model => {
                        const hasConfig = !!modelConfigs[model.id];
                        return (
                          <div key={model.id} className="api-config-item">
                            <div className="api-config-header">
                              <div className="api-config-name">
                                <span>{model.name}</span>
                              </div>
                              <button
                                className={`config-button${hasConfig ? ' configured' : ''}`}
                                onClick={() => setSidebarConfigModel(model.id)}
                              >
                                Configure
                              </button>
                            </div>
                            <div className="api-config-status">
                              <div className={`status-dot${hasConfig ? ' active' : ''}`}></div>
                              <span>{hasConfig ? 'Custom settings' : 'Default settings'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <h3>Preferences</h3>
                <div className="preference-list">
                  <label className="preference-item">
                    <span>Dark Mode</span>
                    <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="toggle" />
                  </label>
                  <label className="preference-item">
                    <span>Show Response Time</span>
                    <input type="checkbox" checked={showResponseTime} onChange={(e) => setShowResponseTime(e.target.checked)} className="toggle" />
                  </label>
                  <label className="preference-item">
                    <span>Server Debug Logging</span>
                    <input type="checkbox" checked={debugLogging} onChange={(e) => setDebugLogging(e.target.checked)} className="toggle" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={`app${darkMode ? '' : ' light-mode'}`}>
      <Sidebar />
      {sidebarConfigModel && createPortal(
        <ModelConfigModal modelId={sidebarConfigModel} onClose={() => setSidebarConfigModel(null)} />,
        document.body
      )}
      {customModelModal && createPortal(
        <CustomModelModal
          editModel={customModelModal.mode === 'edit' ? customModelModal.model : null}
          onClose={() => setCustomModelModal(null)}
        />,
        document.body
      )}
      
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
      </header>

      <main className="main-content">
        <div className={`comparison-grid ${viewMode}`}>
          {viewMode === 'grid' ? (
            <>
              {selectedModels.map((_, index) => (
                <ModelCard key={index} index={index} />
              ))}
              {selectedModels.length === 1 && (
                <div className="add-model-card" onClick={addPanel}>
                  <div className="add-model-icon">+</div>
                  <h3 className="add-model-title">Add a model</h3>
                  <p className="add-model-text">Compare side-by-side by adding another AI model</p>
                </div>
              )}
            </>
          ) : (
            <div className="carousel-wrapper">
              <button className="carousel-nav carousel-prev" onClick={prevCarousel}>
                <ChevronLeft size={28} />
              </button>
              <div className="carousel-card-container">
                <ModelCard index={carouselIndex} />
                <div className="carousel-indicators">
                  {selectedModels.map((_, i) => (
                    <button
                      key={i}
                      className={`carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(i)}
                    />
                  ))}
                </div>
              </div>
              <button className="carousel-nav carousel-next" onClick={nextCarousel}>
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="panel-controls-island">
          <button onClick={removePanel} className="control-btn" disabled={selectedModels.length <= 1}>−</button>
          <button onClick={addPanel} className="control-btn" disabled={selectedModels.length >= 4}>+</button>
        </div>
        
        <div className="input-island">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCompare();
              }
            }}
            placeholder="Type your message here"
            disabled={loading}
            className="message-input"
            rows={1}
          />
          <button className="attach-button">
            <Paperclip size={20} />
          </button>
          <button onClick={handleCompare} disabled={loading} className="send-button">
            <Send size={20} />
          </button>
        </div>

        <div className="view-controls-island">
          <button onClick={() => setViewMode('carousel')} className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}>
            Carousel View
          </button>
          <button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}>
            Grid View
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
