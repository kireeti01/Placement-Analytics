const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const {
  predictPlacement,
  analyzeSkillGap,
  analyzeResume,
  getCompanyRecommendations,
  getAtRiskStudents,
  getTrendForecast
} = require('../controllers/predictionController');

router.post('/placement', authMiddleware, requireAdmin, predictPlacement);
router.post('/skill-gap', authMiddleware, requireAdmin, analyzeSkillGap);
router.post('/resume', authMiddleware, requireAdmin, upload.single('resume'), analyzeResume);
router.get('/companies/:studentId?', authMiddleware, requireAdmin, getCompanyRecommendations);
router.get('/at-risk/:collegeId?', authMiddleware, requireAdmin, getAtRiskStudents);
router.get('/forecast/:collegeId?', authMiddleware, requireAdmin, getTrendForecast);

module.exports = router;
