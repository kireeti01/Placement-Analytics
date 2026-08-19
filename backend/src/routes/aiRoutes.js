const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// Proxy AI prediction
router.post('/predict', async (req, res) => {
  try {
    const result = await aiService.getPrediction(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy skill gap analysis
router.post('/skill-gap', async (req, res) => {
  try {
    const result = await aiService.getSkillGap(req.body.company, req.body.selectedSkills);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy resume analysis
router.post('/resume', async (req, res) => {
  try {
    const result = await aiService.getResumeAnalysis(req.body.filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check for AI service
router.get('/ai-health', async (req, res) => {
  const result = await aiService.healthCheck();
  res.json(result);
});

module.exports = router;
