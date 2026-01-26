function ModelSelector({ models, selectedModel, onChange, label, disabled }) {
  return (
    <div className="model-selector">
      <label>{label}:</label>
      <select 
        value={selectedModel} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">-- Select Model --</option>
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelSelector;
