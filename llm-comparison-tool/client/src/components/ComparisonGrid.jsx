import ModelCard from './ModelCard';

function ComparisonGrid({ responses, selectedModels, loading }) {
  return (
    <div className="comparison-grid">
      {responses.map((response, index) => {
        const modelId = selectedModels[index];
        const modelName = modelId ? modelId.replace(/-/g, ' ').toUpperCase() : null;
        
        return (
          <ModelCard
            key={index}
            response={response}
            modelName={modelName}
            loading={loading && modelId}
          />
        );
      })}
    </div>
  );
}

export default ComparisonGrid;
