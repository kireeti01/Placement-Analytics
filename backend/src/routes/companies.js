const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats
} = require('../controllers/companyController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

router.get('/', authMiddleware, getAllCompanies);
router.get('/stats', authMiddleware, getCompanyStats);
router.get('/:id', authMiddleware, getCompanyById);
router.post('/', authMiddleware, requireAdmin, createCompany);
router.put('/:id', authMiddleware, requireAdmin, updateCompany);
router.delete('/:id', authMiddleware, requireAdmin, deleteCompany);

module.exports = router;
