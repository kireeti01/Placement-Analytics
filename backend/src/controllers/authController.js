const { User, College, AdminAccount } = require('../models');
const { generateToken } = require('../config/auth');
const { sendSupportRequestEmail } = require('../services/emailService');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', { username });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // FIRST: Check if user exists in AdminAccount table (for college admins)
    let adminAccount = await AdminAccount.findOne({ 
      where: { username, is_active: true } 
    });
    
    if (adminAccount) {
      console.log('✅ Found in AdminAccount:', adminAccount.username);
      
      // Validate password
      const isValid = await adminAccount.validatePassword(password);
      if (!isValid) {
        console.log('❌ Password validation failed for AdminAccount');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get college info
      const college = await College.findByPk(adminAccount.college_id);
      
      // Generate token for admin account
      const token = generateToken({ 
        id: adminAccount.id, 
        username: adminAccount.username, 
        role: 'admin',
        collegeId: adminAccount.college_id 
      });

      return res.json({
        token,
        user: {
          id: adminAccount.id,
          username: adminAccount.username,
          email: adminAccount.email,
          role: 'admin',
          college_id: adminAccount.college_id
        },
        college: college ? { id: college.id, name: college.name, code: college.code } : null,
        role: 'admin'
      });
    }

    // SECOND: Check if user exists in User table (Super Admin)
    let user = await User.findOne({ where: { username } });
    if (user) {
      console.log('✅ Found in Users:', user.username);
      
      // Validate password
      const isValid = await user.validatePassword(password);
      if (!isValid) {
        console.log('❌ Password validation failed for User');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      const token = generateToken(user);
      const userData = user.toJSON();
      
      let college = null;
      if (user.college_id) {
        college = await College.findByPk(user.college_id, {
          attributes: ['id', 'name', 'code']
        });
      }

      return res.json({
        token,
        user: userData,
        college,
        role: user.role
      });
    }

    // If no user found in either table
    console.log('❌ User not found in any table');
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = req.user;
    let college = null;
    if (user.college_id) {
      college = await College.findByPk(user.college_id, {
        attributes: ['id', 'name', 'code']
      });
    }
    res.json({ user: user.toJSON(), college });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.contactSuperAdmin = async (req, res) => {
  try {
    const { name, email, collegeName, username, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const supportRecipient = process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_EMAIL !== 'superadmin@campusplacement.ai'
      ? process.env.SUPER_ADMIN_EMAIL
      : process.env.EMAIL_USER || 'accsupportive@gmail.com';

    const supportResult = await sendSupportRequestEmail({
      name,
      email,
      collegeName,
      username,
      message,
      recipient: supportRecipient
    });

    if (!supportResult.success) {
      return res.status(500).json({ error: 'Failed to send support request' });
    }

    res.json({
      success: true,
      message: 'Your issue has been sent to the super admin team.'
    });
  } catch (error) {
    console.error('Contact super admin error:', error);
    res.status(500).json({ error: 'Failed to send support request' });
  }
};
