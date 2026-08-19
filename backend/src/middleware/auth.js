const { verifyToken } = require('../config/auth');
const { User, AdminAccount } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    let user;
    if (decoded.role === 'admin') {
      user = await AdminAccount.findByPk(decoded.id);
      if (user) {
        user.role = 'admin';
      }
    } else {
      user = await User.findByPk(decoded.id);
    }

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireCollegeAccess = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  const requestedCollegeId = req.params.collegeId || req.body.college_id || req.query.college_id;
  
  if (!requestedCollegeId) {
    req.collegeId = req.user.college_id;
    return next();
  }
  
  if (req.user.college_id !== requestedCollegeId) {
    return res.status(403).json({ error: 'Access denied to this college data' });
  }
  
  req.collegeId = requestedCollegeId;
  next();
};

module.exports = { authMiddleware, requireSuperAdmin, requireAdmin, requireCollegeAccess };
