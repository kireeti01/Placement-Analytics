const express = require('express');
const router = express.Router();
const { getDashboardStats, getTrendData } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/trends', authMiddleware, getTrendData);

module.exports = router;
