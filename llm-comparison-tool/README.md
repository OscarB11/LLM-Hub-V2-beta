# LLM Comparison Tool

A web application that enables users to compare outputs from up to 4 different LLM models simultaneously, with built-in support for Gemini and OpenAI models.

## 📁 Project Structure

```
llm-comparison-tool/
├── client/                    # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ComparisonGrid.jsx    # Main grid layout for 4 models
│   │   │   ├── ModelCard.jsx         # Individual model response card
│   │   │   ├── PromptInput.jsx       # User input component
│   │   │   ├── ModelSelector.jsx     # Dropdown for model selection
│   │   │   └── Header.jsx            # App header
│   │   ├── services/         # API communication
│   │   │   └── api.js               # API service functions
│   │   ├── styles/           # CSS files
│   │   │   └── App.css
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   └── llmController.js
│   │   ├── services/         # LLM API integrations
│   │   │   ├── openaiService.js
│   │   │   └── geminiService.js
│   │   ├── routes/           # API routes
│   │   │   └── llmRoutes.js
│   │   ├── config/           # Configuration
│   │   │   └── models.js
│   │   └── server.js         # Express server setup
│   ├── .env.example
│   └── package.json
│
└── README.md                  # This file
```

## 🚀 Step-by-Step Implementation Plan

### Phase 1: Backend Setup (Server)

#### Step 1.1: Initialize Node.js Server
```bash
cd server
npm init -y
npm install express cors dotenv axios @google/generative-ai openai
npm install --save-dev nodemon
```

#### Step 1.2: Configure Environment Variables
Create `server/.env` file with:
```
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Step 1.3: Create Server Files
- **server.js**: Express server setup with CORS and routes
- **models.js**: Configuration for available models (GPT-3.5, GPT-4, Gemini Pro, Gemini Ultra)
- **openaiService.js**: OpenAI API integration
- **geminiService.js**: Google Gemini API integration
- **llmController.js**: Handle requests and coordinate API calls
- **llmRoutes.js**: Define API endpoints

#### Step 1.4: Update package.json Scripts
Add to `server/package.json`:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### Phase 2: Frontend Setup (Client)

#### Step 2.1: Initialize React with Vite
```bash
cd client
npm create vite@latest . -- --template react
npm install axios
```

#### Step 2.2: Create React Components
- **PromptInput.jsx**: Text area for user input with submit button
- **ModelSelector.jsx**: Dropdown for each of 4 slots to select models
- **ModelCard.jsx**: Display model name, loading state, and response
- **ComparisonGrid.jsx**: 2x2 grid layout containing 4 ModelCards
- **Header.jsx**: App title and branding

#### Step 2.3: Create API Service
- **api.js**: Axios instance with base URL and API call functions

#### Step 2.4: Style the Application
- **App.css**: Grid layout, card styling, responsive design

#### Step 2.5: Update package.json Scripts
Ensure `client/package.json` has:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Phase 3: Core Features Implementation

#### Step 3.1: Backend API Endpoints
Create the following endpoints:
- `GET /api/models` - List available models
- `POST /api/compare` - Send prompt to selected models

#### Step 3.2: OpenAI Integration
Implement functions to:
- Connect to OpenAI API
- Send prompts to GPT models
- Handle responses and errors

#### Step 3.3: Gemini Integration
Implement functions to:
- Connect to Google Gemini API
- Send prompts to Gemini models
- Handle responses and errors

#### Step 3.4: Frontend State Management
- Store selected models for each slot
- Manage prompt input state
- Handle loading states for each model
- Display responses in respective cards

#### Step 3.5: API Communication
- Create function to call `/api/compare` endpoint
- Send selected models and prompt
- Handle responses and update UI

### Phase 4: UI/UX Enhancements

#### Step 4.1: Loading States
- Show spinners while waiting for responses
- Disable submit button during processing

#### Step 4.2: Error Handling
- Display error messages for failed API calls
- Show user-friendly error notifications

#### Step 4.3: Responsive Design
- Ensure grid works on mobile (stack vertically)
- Make cards scrollable for long responses

#### Step 4.4: Additional Features
- Copy response to clipboard button
- Clear all responses button
- Response time display for each model
- Token count estimate

### Phase 5: Testing & Deployment

#### Step 5.1: Local Testing
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

#### Step 5.2: Test All Features
- Test each model individually
- Test all 4 models simultaneously
- Test error scenarios (invalid API key, network errors)
- Test responsive design

#### Step 5.3: Build for Production
```bash
cd client
npm run build
```

#### Step 5.4: Deployment Options
- **Backend**: Deploy to Heroku, Railway, or Render
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages

## 📋 Requirements

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Google Gemini API key

## 🔑 Getting API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Gemini**: https://makersuite.google.com/app/apikey

## 🎯 Features

- ✅ Compare up to 4 LLM models side-by-side
- ✅ Support for OpenAI models (GPT-3.5, GPT-4)
- ✅ Support for Google Gemini models
- ✅ Real-time response display
- ✅ Responsive grid layout
- ✅ Error handling and loading states

## 📝 Usage

1. Select up to 4 models from the dropdowns
2. Enter your prompt in the text area
3. Click "Compare" to send the prompt to all selected models
4. View and compare the responses in real-time

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios
- **Backend**: Node.js, Express
- **APIs**: OpenAI API, Google Gemini API
