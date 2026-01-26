import OpenAI from 'openai';

const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

const openai = hasApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

export const generateOpenAIResponse = async (prompt, modelId) => {
  try {
    const startTime = Date.now();
    
    // Mock response for testing without API key
    if (!hasApiKey) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      const endTime = Date.now();
      return {
        success: true,
        content: `[DEMO MODE - No API Key] This is a simulated response from ${modelId}.\n\nYour prompt was: "${prompt}"\n\nTo get real responses, please add your OpenAI API key to the .env file.\n\nThis mock response demonstrates how the UI displays model outputs. In production, this would contain the actual AI-generated response from ${modelId}.`,
        responseTime: endTime - startTime,
        tokens: 150
      };
    }
    
    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      content: completion.choices[0].message.content,
      responseTime,
      tokens: completion.usage.total_tokens
    };
  } catch (error) {
    console.error(`OpenAI API Error (${modelId}):`, error.message);
    return {
      success: false,
      error: error.message || 'Failed to generate response from OpenAI'
    };
  }
};
