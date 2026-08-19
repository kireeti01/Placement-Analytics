const express = require('express');
const router = express.Router();
const {
  getAllPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementStats
} = require('../controllers/placementController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

router.get('/', authMiddleware, getAllPlacements);
router.get('/stats', authMiddleware, getPlacementStats);
router.post('/', authMiddleware, requireAdmin, createPlacement);
router.put('/:id', authMiddleware, requireAdmin, updatePlacement);
router.delete('/:id', authMiddleware, requireAdmin, deletePlacement);

module.exports = router;
