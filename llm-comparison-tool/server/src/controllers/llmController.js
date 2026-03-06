import { generateOpenAIResponse } from '../services/openaiService.js';
import { generateGeminiResponse } from '../services/geminiService.js';
import { getModelById } from '../config/models.js';

// ENV var acts as a hard off-switch (DEBUG_REQUESTS=false disables regardless of client)
const debugEnabled = (reqFlag) => process.env.DEBUG_REQUESTS !== 'false' && reqFlag !== false;

const logRequest = (prompt, models, configs, debug) => {
  if (!debugEnabled(debug)) return;
  const divider = '─'.repeat(60);
  const ts = new Date().toLocaleTimeString();
  console.log(`\n\x1b[36m${divider}\x1b[0m`);
  console.log(`\x1b[36m🔍 COMPARISON REQUEST\x1b[0m  \x1b[90m${ts}\x1b[0m`);
  console.log(`\x1b[36m${divider}\x1b[0m`);
  console.log(`\x1b[33m📝 Prompt:\x1b[0m ${prompt.length > 120 ? prompt.slice(0, 120) + '…' : prompt}`);
  console.log(`\x1b[33m🤖 Models (${models.length}):\x1b[0m`);
  models.forEach((modelId, i) => {
    const info = getModelById(modelId);
    const cfg = configs[i] || {};
    console.log(`\n  \x1b[32m[${i + 1}] ${info?.name || modelId}\x1b[0m  \x1b[90m(${modelId})\x1b[0m`);
    console.log(`       Provider    : ${info?.provider || 'unknown'}`);
    console.log(`       Temperature : ${cfg.temperature ?? '—'}`);
    console.log(`       Max Tokens  : ${cfg.maxTokens ?? '—'}`);
    console.log(`       Top P       : ${cfg.topP ?? '—'}`);
    if (cfg.thinkingLevel && cfg.thinkingLevel !== 'auto') {
      console.log(`       Thinking    : ${cfg.thinkingLevel}`);
    }
    if (cfg.groundingEnabled) {
      console.log(`       Grounding   : \x1b[32menabled\x1b[0m`);
    }
    if (cfg.systemPrompt) {
      const sp = cfg.systemPrompt.length > 60 ? cfg.systemPrompt.slice(0, 60) + '…' : cfg.systemPrompt;
      console.log(`       System      : "${sp}"`);
    }
  });
  console.log(`\n\x1b[36m${divider}\x1b[0m\n`);
};

const logResponse = (modelId, result, duration, debug) => {
  if (!debugEnabled(debug)) return;
  const info = getModelById(modelId);
  const status = result.success ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  const name = info?.name || modelId;
  if (result.success) {
    console.log(`  ${status} \x1b[32m${name}\x1b[0m  \x1b[90m${duration}ms${result.tokens ? ` · ${(result.tokens.input || 0) + (result.tokens.output || 0)} tokens` : ''}\x1b[0m`);
  } else {
    console.log(`  ${status} \x1b[31m${name}\x1b[0m  \x1b[90m${duration}ms\x1b[0m  \x1b[31m${result.error}\x1b[0m`);
  }
};

export const compareModels = async (req, res) => {
  try {
    const { prompt, models, configs = [], debug = true } = req.body;

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
    logRequest(prompt, models, configs, debug);
    if (debugEnabled(debug)) console.log('\x1b[33m⏳ Waiting for responses...\x1b[0m');

    const responses = await Promise.all(
      models.map(async (modelId, i) => {
        const modelInfo = getModelById(modelId);
        const config = configs[i] || {};
        const start = Date.now();
        
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
          result = await generateOpenAIResponse(prompt, modelId, config);
        } else if (modelInfo.provider === 'gemini') {
          result = await generateGeminiResponse(prompt, modelId, config);
        }

        logResponse(modelId, result, Date.now() - start, debug);
        return {
          modelId,
          modelName: modelInfo.name,
          ...result
        };
      })
    );

    if (debugEnabled(debug)) console.log('');
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
