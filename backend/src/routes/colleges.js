const express = require('express');
const router = express.Router();
const {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  requestRegistration,
  approveRequest,
  rejectRequest,
  getPendingRequests,
  getAllRequests,
  getAllAdminAccounts,
  createAdminAccount,
  resetAdminPassword,
  deleteAdminAccount
} = require('../controllers/collegeController');
const { authMiddleware, requireSuperAdmin, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllColleges);
router.post('/register', requestRegistration);

// Super Admin only
router.get('/requests', authMiddleware, requireSuperAdmin, getAllRequests);
router.get('/requests/pending', authMiddleware, requireSuperAdmin, getPendingRequests);
router.post('/', authMiddleware, requireSuperAdmin, createCollege);
router.put('/:id', authMiddleware, requireSuperAdmin, updateCollege);
router.delete('/:id', authMiddleware, requireSuperAdmin, deleteCollege);
router.put('/approve/:id', authMiddleware, requireSuperAdmin, approveRequest);
router.put('/reject/:id', authMiddleware, requireSuperAdmin, rejectRequest);

// Admin account routes (Super Admin only)
router.get('/admins', authMiddleware, requireSuperAdmin, getAllAdminAccounts);
router.post('/admins', authMiddleware, requireSuperAdmin, createAdminAccount);
router.put('/admins/:id/reset-password', authMiddleware, requireSuperAdmin, resetAdminPassword);
router.delete('/admins/:id', authMiddleware, requireSuperAdmin, deleteAdminAccount);

// Admin + Super Admin (requires authentication)
router.get('/:id', authMiddleware, requireAdmin, getCollegeById);

module.exports = router;
