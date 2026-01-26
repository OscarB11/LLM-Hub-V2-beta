import { GoogleGenerativeAI } from '@google/generative-ai';

const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

const genAI = hasApiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const generateGeminiResponse = async (prompt, modelId) => {
  try {
    const startTime = Date.now();
    
    // Mock response for testing without API key
    if (!hasApiKey) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      const endTime = Date.now();
      return {
        success: true,
        content: `[DEMO MODE - No API Key] This is a simulated response from ${modelId}.\n\nYour prompt was: "${prompt}"\n\nTo get real responses, please add your Gemini API key to the .env file.\n\nThis mock response shows how the interface displays outputs from different models side-by-side. With a valid API key, you'd see actual AI-generated content here.`,
        responseTime: endTime - startTime,
        tokens: null
      };
    }
    
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      content: text,
      responseTime,
      tokens: null // Gemini API doesn't provide token count in the same way
    };
  } catch (error) {
    console.error(`Gemini API Error (${modelId}):`, error.message);
    return {
      success: false,
      error: error.message || 'Failed to generate response from Gemini'
    };
  }
};
