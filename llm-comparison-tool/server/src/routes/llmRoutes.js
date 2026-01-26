import express from 'express';
import { compareModels } from '../controllers/llmController.js';
import { AVAILABLE_MODELS } from '../config/models.js';

const router = express.Router();

// Get available models
router.get('/models', (req, res) => {
  res.json({ models: AVAILABLE_MODELS });
});

// Compare models
router.post('/compare', compareModels);

export default router;
