const express = require('express');
const router = express.Router();
const { login, me, logout, contactSuperAdmin } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.post('/contact-super-admin', contactSuperAdmin);

module.exports = router;
