import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getAvailableModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const compareModels = async (prompt, models) => {
  try {
    const response = await api.post('/compare', {
      prompt,
      models
    });
    return response.data.responses;
  } catch (error) {
    console.error('Error comparing models:', error);
    throw error;
  }
};
