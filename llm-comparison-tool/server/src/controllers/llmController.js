import { generateOpenAIResponse } from '../services/openaiService.js';
import { generateGeminiResponse } from '../services/geminiService.js';
import { getModelById } from '../config/models.js';

export const compareModels = async (req, res) => {
  try {
    const { prompt, models } = req.body;

    if (!prompt || !models || models.length === 0) {
      return res.status(400).json({
        error: 'Prompt and models array are required'
      });
    }

    if (models.length > 4) {
      return res.status(400).json({
        error: 'Maximum 4 models can be compared at once'
      });
    }

    // Generate responses from all selected models in parallel
    const responses = await Promise.all(
      models.map(async (modelId) => {
        const modelInfo = getModelById(modelId);
        
        if (!modelInfo) {
          return {
            modelId,
            modelName: modelId,
            success: false,
            error: 'Model not found'
          };
        }

        let result;
        if (modelInfo.provider === 'openai') {
          result = await generateOpenAIResponse(prompt, modelId);
        } else if (modelInfo.provider === 'gemini') {
          result = await generateGeminiResponse(prompt, modelId);
        }

        return {
          modelId,
          modelName: modelInfo.name,
          ...result
        };
      })
    );

    res.json({
      prompt,
      responses
    });
  } catch (error) {
    console.error('Error in compareModels:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
