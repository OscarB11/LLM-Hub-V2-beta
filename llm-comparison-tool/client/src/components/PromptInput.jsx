function PromptInput({ value, onChange, onSubmit, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onSubmit();
    }
  };

  return (
    <div className="prompt-input-container">
      <label htmlFor="prompt">Enter your prompt:</label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question or prompt here... (Ctrl+Enter to submit)"
        disabled={disabled}
        rows={4}
      />
    </div>
  );
}

export default PromptInput;
