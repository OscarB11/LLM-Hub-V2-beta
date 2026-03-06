export const AVAILABLE_MODELS = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient for most tasks',
    contextWindow: 16385
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Most capable OpenAI model',
    contextWindow: 8192
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 with improved performance',
    contextWindow: 128000
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Hybrid reasoning model with thinking budgets and 1M context',
    contextWindow: 1000000,
    maxOutputTokens: 65536
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    description: 'Google\'s latest Gemini 3.1 Pro preview model',
    contextWindow: 1000000
  },
  {
    id: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash Lite Preview',
    provider: 'gemini',
    description: 'Fast and lightweight Gemini 3.1 Flash Lite preview',
    contextWindow: 1000000
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'gemini',
    description: 'Google\'s Gemini 3 Flash preview model',
    contextWindow: 1000000,
    maxOutputTokens: 64000
  }
];

export const getModelById = (id) => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};
