# LLM Comparison Tool

A web application that enables users to compare outputs from up to 4 different LLM models simultaneously. Compare responses side-by-side to evaluate quality, style, and accuracy.

## Current Implementation Status

- **Google Gemini Models** - Fully implemented and working
- **OpenAI Models** - Placeholder code only (needs implementation)

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (required)
- OpenAI API key (optional - for future implementation)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd llm-comparison-tool
```

### 2. Set Up Environment Variables

```bash
cd server
copy .env.example .env
```

Edit `server/.env` and add your API keys:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Set to 'false' to disable request debug logging
DEBUG_REQUESTS=true
```

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Run the Application

Open **two terminal windows**:

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
```

Backend runs on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:3000`

### 5. Open in Browser

Navigate to `http://localhost:3000` in your web browser.

## Getting API Keys

### Google Gemini API Key (Required)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### OpenAI API Key (Optional - Not Yet Implemented)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file

## Available Models

### Google Gemini Models (Working)

- **Gemini 2.5 Flash** - Hybrid reasoning model with 1M context window
- **Gemini 3.1 Pro Preview** - Latest Gemini 3.1 Pro model
- **Gemini 3.1 Flash Lite Preview** - Fast and lightweight version
- **Gemini 3 Flash Preview** - Gemini 3 Flash with 1M context

### OpenAI Models (Placeholder Only)

- **GPT-3.5 Turbo** - Fast and efficient
- **GPT-4** - Most capable OpenAI model
- **GPT-4 Turbo** - Latest GPT-4 with improved performance

## How to Use

1. **Select Models**: Choose up to 4 models from the dropdown menus
2. **Enter Prompt**: Type your question or prompt in the text area
3. **Compare**: Click "Compare Models" to send the prompt to all selected models
4. **View Results**: See responses displayed side-by-side in real-time

## Adding New Gemini Models

To add a new Gemini model, edit `server/src/config/models.js`:

```javascript
export const AVAILABLE_MODELS = [
  // ...existing models...
  {
    id: 'gemini-pro-vision',              // Model ID used by API
    name: 'Gemini Pro Vision',            // Display name
    provider: 'gemini',                   // Must be 'gemini' for Gemini models
    description: 'Multimodal model for text and images',
    contextWindow: 30720,                 // Token limit
    maxOutputTokens: 2048                 // Optional: max response length
  }
];
```

**Important Notes:**
- The `id` must match the actual model ID used by Google's API
- Set `provider: 'gemini'` for all Gemini models
- The model will automatically appear in the frontend dropdowns

## Project Structure

```
llm-comparison-tool/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComparisonGrid.jsx  # 4-model grid layout
│   │   │   ├── ModelCard.jsx       # Individual model display
│   │   │   ├── PromptInput.jsx     # User input component
│   │   │   ├── ModelSelector.jsx   # Model dropdown
│   │   │   └── Header.jsx          # App header
│   │   ├── services/
│   │   │   └── api.js              # API calls to backend
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                          # Node.js backend (Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── models.js           # Model configurations
│   │   ├── services/
│   │   │   ├── geminiService.js    # Gemini API integration (Working)
│   │   │   └── openaiService.js    # Placeholder only
│   │   ├── controllers/
│   │   │   └── llmController.js    # Request handlers
│   │   ├── routes/
│   │   │   └── llmRoutes.js        # API routes
│   │   └── server.js               # Express server
│   ├── .env.example                # Template for environment variables
│   ├── .gitignore
│   └── package.json
│
└── README.md                        # This file
```

## Tech Stack

- **Frontend**: React, Vite, Axios, Lucide Icons
- **Backend**: Node.js, Express
- **APIs**: Google Generative AI SDK, OpenAI SDK (placeholder)

## Security Notes

**IMPORTANT**: Never commit your `.env` file to version control!

- The `.env` file is already in `.gitignore`
- Never share screenshots containing API keys
- Regenerate keys immediately if accidentally exposed
- Keep your API keys secure and private

## Troubleshooting

### Backend won't start
- Check that `.env` file exists in the `server/` directory
- Verify your `GEMINI_API_KEY` is valid
- Ensure port 5000 is not already in use

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Make sure the API URL in `client/src/services/api.js` is correct

### "Model not found" errors
- Verify the model ID in `models.js` matches Google's API
- Check that your API key has access to the model
- Some models may be in limited preview

## License

MIT


## Roadmap

- [ ] Implement OpenAI API integration
- [ ] Add token usage tracking
- [ ] Add response time metrics
- [ ] Add export/save comparison feature
- [ ] Add support for Claude/Anthropic models
- [ ] Add conversation history
- [ ] Add streaming responses
