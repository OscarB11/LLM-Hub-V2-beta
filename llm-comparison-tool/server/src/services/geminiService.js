import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Parse Gemini API errors into user-friendly messages.
 */
const parseGeminiError = (error) => {
  const raw = error.message || '';

  // Try to extract the embedded JSON details array from the error message
  let details = null;
  try {
    // The SDK often serialises the full gRPC status as JSON inside the message
    const jsonMatch = raw.match(/\[(\{.*"@type".*\})\s*\]/s) || raw.match(/(\[.*\])/s);
    if (jsonMatch) details = JSON.parse(jsonMatch[0]);
  } catch (_) {}

  // Also check if the error object itself carries statusDetails / details
  if (!details && error.statusDetails) details = error.statusDetails;
  if (!details && error.details) details = error.details;

  // HTTP status code check (429 = Too Many Requests)
  const status = error.status || error.httpStatus || error.code;
  const isQuota = status === 429 || status === 'RESOURCE_EXHAUSTED' ||
    raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota') ||
    raw.includes('rate limit') || raw.includes('FreeTier') ||
    raw.includes('GenerateRequests') || raw.includes('InputTokens');

  if (isQuota) {
    // Try to pull the retry delay out of the details
    let retrySeconds = null;
    if (Array.isArray(details)) {
      const retryInfo = details.find(d => d['@type']?.includes('RetryInfo'));
      if (retryInfo?.retryDelay) {
        retrySeconds = parseInt(retryInfo.retryDelay, 10) || null;
      }

      // Check if it's a daily limit vs per-minute limit
      const quotaFailure = details.find(d => d['@type']?.includes('QuotaFailure'));
      const violations = quotaFailure?.violations || [];
      const isDaily = violations.some(v =>
        v.quotaId?.includes('PerDay') || v.quotaId?.includes('PerModelPerDay')
      );

      if (isDaily) {
        return `Daily quota limit reached for this model on the free tier. ` +
          `You've used your full daily allowance of requests or input tokens. ` +
          `Try again tomorrow or upgrade to a paid Gemini API plan.`;
      }
    }

    if (retrySeconds !== null) {
      return `Rate limit reached — free tier quota exceeded. ` +
        `Please wait ${retrySeconds} seconds before sending another request, ` +
        `or switch to a different model.`;
    }

    return `Rate limit or quota exceeded for this model. ` +
      `You may have hit the free tier per-minute or per-day limit. ` +
      `Wait a moment and try again, or switch models.`;
  }

  // API key issues
  if (raw.includes('API_KEY_INVALID') || raw.includes('invalid api key') || status === 401 || status === 403) {
    return 'Invalid or missing Gemini API key. Check your GEMINI_API_KEY in the .env file.';
  }

  // Model not found / not available
  if (raw.includes('not found') || raw.includes('NOT_FOUND') || status === 404) {
    return 'This Gemini model was not found. It may have been retired or the model ID is incorrect.';
  }

  // Generic fallback
  return raw || 'Failed to generate response from Gemini.';
};

export const generateGeminiResponse = async (prompt, modelId, config = {}) => {
  const startTime = Date.now();

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';

  if (!hasApiKey) {
    return {
      success: false,
      error: 'No Gemini API key configured. Add GEMINI_API_KEY to your .env file.'
    };
  }

  const {
    temperature = 1,
    maxTokens = 65536,
    topP = 0.95,
    systemPrompt = '',
    thinkingLevel = 'auto',
    groundingEnabled = false
  } = config;

  const thinkingBudgetMap = { none: 0, low: 1024, medium: 8192, high: 24576 };
  const thinkingConfig = thinkingLevel !== 'auto' && thinkingLevel in thinkingBudgetMap
    ? { thinkingBudget: thinkingBudgetMap[thinkingLevel] }
    : undefined;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Newer models (2.5+, 3.x) use googleSearch; older models use googleSearchRetrieval
    const usesNewSearchTool = /gemini-(2\.[5-9]|[3-9]\.)/.test(modelId);
    const searchTool = usesNewSearchTool ? { googleSearch: {} } : { googleSearchRetrieval: {} };
    const model = genAI.getGenerativeModel({
      model: modelId,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
      ...(groundingEnabled ? { tools: [searchTool] } : {})
    });

    const generationConfig = {
      temperature,
      maxOutputTokens: maxTokens,
      topP,
      ...(thinkingConfig ? { thinkingConfig } : {})
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });
    const response = result.response;
    const text = response.text();
    const endTime = Date.now();

    let inputTokens = null;
    let outputTokens = null;
    try {
      const usage = response.usageMetadata;
      if (usage) {
        inputTokens = usage.promptTokenCount ?? null;
        outputTokens = usage.candidatesTokenCount ?? null;
      }
    } catch (_) {}

    let groundingSources = null;
    try {
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks?.length) {
        groundingSources = chunks
          .filter(c => c.web?.uri)
          .map(c => ({ title: c.web.title || c.web.uri, uri: c.web.uri }));
      }
    } catch (_) {}

    return {
      success: true,
      content: text,
      responseTime: endTime - startTime,
      tokens: outputTokens !== null ? { input: inputTokens, output: outputTokens } : null,
      ...(groundingSources ? { groundingSources } : {})
    };
  } catch (error) {
    console.error(`Gemini API Error (${modelId}):`, error.message);
    return {
      success: false,
      error: parseGeminiError(error)
    };
  }
};
