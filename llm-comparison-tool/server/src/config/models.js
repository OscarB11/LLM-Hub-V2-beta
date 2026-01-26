export const AVAILABLE_MODELS = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Most capable OpenAI model'
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 with improved performance'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: 'Google\'s powerful multimodal model'
  },
  {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Enhanced version with larger context window'
  }
];

export const getModelById = (id) => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};
