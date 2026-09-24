const express = require('express');
const router = express.Router();
const { login, me, logout, contactSuperAdmin } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const { testSMTP } = require('../services/emailService');

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.post('/contact-super-admin', contactSuperAdmin);

router.all('/test-email', async (req, res) => {
  const targetEmail = req.query.to || req.body.to || 'kireeti213@gmail.com';
  const result = await testSMTP(targetEmail);
  res.json(result);
});

module.exports = router;

