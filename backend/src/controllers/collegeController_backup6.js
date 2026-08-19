const { College, User, CollegeRequest, AdminAccount } = require('../models');
const { sendCredentialsEmail } = require('../services/emailService');

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.findAll({
      attributes: { exclude: ['created_at', 'updated_at'] }
    });
    res.json(colleges);
  } catch (error) {
    console.error('Get all colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

// Get college by ID
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch college' });
  }
};

// Create college (Super Admin only)
exports.createCollege = async (req, res) => {
  try {
    const { name, code, address, city, state, pincode, phone, email, website, established_year } = req.body;

    const existing = await College.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: 'College code already exists' });
    }

    const college = await College.create({
      name,
      code,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website,
      established_year,
      created_by: req.user.id
    });

    res.status(201).json(college);
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ error: 'Failed to create college' });
  }
};

// Update college
exports.updateCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    await college.update(req.body);
    res.json(college);
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
};

// Delete college (Super Admin only)
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    await college.destroy();
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ error: 'Failed to delete college' });
  }
};

// College Registration Request
exports.requestRegistration = async (req, res) => {
  try {
    const requestData = req.body;
    
    const existing = await College.findOne({ where: { code: requestData.college_code } });
    if (existing) {
      return res.status(400).json({ error: 'College code already exists' });
    }

    const existingRequest = await CollegeRequest.findOne({
      where: { 
        college_code: requestData.college_code, 
        status: 'pending' 
      }
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'Registration already pending for this college' });
    }

    const request = await CollegeRequest.create({
      college_name: requestData.college_name,
      college_code: requestData.college_code,
      address: requestData.address,
      city: requestData.city,
      state: requestData.state,
      pincode: requestData.pincode,
      phone: requestData.phone,
      email: requestData.email,
      website: requestData.website,
      established_year: requestData.established_year,
      admin_name: requestData.admin_name,
      admin_email: requestData.admin_email,
      admin_phone: requestData.admin_phone,
      message: requestData.message
    });

    console.log('Registration request created:', request.id);
    res.status(201).json({ message: 'Registration request submitted', request });
  } catch (error) {
    console.error('Registration request error:', error);
    res.status(500).json({ error: 'Failed to submit registration request' });
  }
};

// Approve College Request (Super Admin only)
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Approving request:', id);
    
    const request = await CollegeRequest.findByPk(id);
    
    if (!request) {
      console.log('Request not found:', id);
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      console.log('Request already processed, status:', request.status);
      return res.status(400).json({ error: 'Request already processed' });
    }

    const existingCollege = await College.findOne({ where: { code: request.college_code } });
    if (existingCollege) {
      console.log('College code already exists:', request.college_code);
      return res.status(400).json({ error: 'College code already exists' });
    }

    const baseUsername = request.college_code.toLowerCase() + '_admin';
    const plainPassword = 'College@' + Math.floor(Math.random() * 10000) + '!';
    
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    let existingAdmin = await AdminAccount.findOne({ where: { username: baseUsername } });
    let existingUser = await User.findOne({ where: { username: baseUsername } });
    
    let finalUsername = baseUsername;
    let counter = 1;
    while (existingAdmin || existingUser) {
      finalUsername = baseUsername + '_' + counter;
      counter++;
      existingAdmin = await AdminAccount.findOne({ where: { username: finalUsername } });
      existingUser = await User.findOne({ where: { username: finalUsername } });
    }
    
    console.log('Unique username found:', finalUsername);

    const college = await College.create({
      name: request.college_name,
      code: request.college_code,
      address: request.address,
      city: request.city,
      state: request.state,
      pincode: request.pincode,
      phone: request.phone,
      email: request.email,
      website: request.website,
      established_year: request.established_year,
      created_by: req.user.id,
      status: 'active'
    });

    console.log('College created:', college.id);

    await request.update({
      status: 'approved',
      reviewed_at: new Date(),
      reviewed_by: req.user.id
    });

    console.log('Request updated to approved');

    const adminAccount = await AdminAccount.create({
      username: finalUsername,
      password_hash: hashedPassword,
      email: request.admin_email,
      college_id: college.id,
      college_name: college.name,
      created_by: req.user.id,
      is_active: true
    });

    console.log('Admin account created:', finalUsername);
    console.log('Password (plain):', plainPassword);

    try {
      await sendCredentialsEmail(
        request.admin_email,
        finalUsername,
        plainPassword,
        college.name
      );
      console.log('Email sent to:', request.admin_email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(200).json({
      message: 'College approved and admin created',
      college: {
        id: college.id,
        name: college.name,
        code: college.code
      },
      credentials: {
        username: finalUsername,
        password: plainPassword,
        email: request.admin_email
      }
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve request: ' + error.message });
  }
};

// Reject College Request (Super Admin only)
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await CollegeRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    await request.update({
      status: 'rejected',
      reviewed_at: new Date(),
      reviewed_by: req.user.id
    });

    console.log('College rejected:', request.college_name);
    res.json({ message: 'College request rejected' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

// Get all pending requests (Super Admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await CollegeRequest.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']]
    });
    console.log('Pending requests count:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

// Get all requests (Super Admin only)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await CollegeRequest.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log('All requests count:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests: ' + error.message });
  }
};

// Get all admin accounts (Super Admin only)
exports.getAllAdminAccounts = async (req, res) => {
  try {
    const accounts = await AdminAccount.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: College, attributes: ['id', 'name', 'code'] }
      ]
    });
    res.json(accounts);
  } catch (error) {
    console.error('Get admin accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch admin accounts' });
  }
};

// Create admin account manually (Super Admin only)
exports.createAdminAccount = async (req, res) => {
  try {
    let { username, password, email, college_id, college_name } = req.body;

    let existingAdmin = await AdminAccount.findOne({ where: { username } });
    let existingUser = await User.findOne({ where: { username } });
    
    let finalUsername = username;
    let counter = 1;
    while (existingAdmin || existingUser) {
      finalUsername = username + '_' + counter;
      counter++;
      existingAdmin = await AdminAccount.findOne({ where: { username: finalUsername } });
      existingUser = await User.findOne({ where: { username: finalUsername } });
    }
    
    console.log('Unique username found:', finalUsername);

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminAccount = await AdminAccount.create({
      username: finalUsername,
      password_hash: hashedPassword,
      email,
      college_id,
      college_name,
      created_by: req.user.id,
      is_active: true
    });

    try {
      await sendCredentialsEmail(email, finalUsername, password, college_name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Admin account created',
      account: adminAccount.toJSON(),
      credentials: {
        username: finalUsername,
        password: password
      }
    });
  } catch (error) {
    console.error('Create admin account error:', error);
    res.status(500).json({ error: 'Failed to create admin account: ' + error.message });
  }
};

// Reset admin password (Super Admin only) - FIXED
exports.resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    console.log('Resetting password for admin:', id);
    
    if (!newPassword) {
      console.log('No new password provided');
      return res.status(400).json({ error: 'New password is required' });
    }

    const admin = await AdminAccount.findByPk(id);
    if (!admin) {
      console.log('Admin account not found');
      return res.status(404).json({ error: 'Admin account not found' });
    }

    console.log('Admin found:', admin.username);

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await admin.update({ password_hash: hashedPassword });
    
    console.log('Password reset successfully for:', admin.username);
    console.log('New password:', newPassword);
    
    try {
      await sendCredentialsEmail(
        admin.email,
        admin.username,
        newPassword,
        admin.college_name
      );
      console.log('Email sent to:', admin.email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(200).json({ 
      message: 'Password reset successfully',
      username: admin.username,
      newPassword: newPassword,
      email: admin.email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password: ' + error.message });
  }
};

// Delete admin account (Super Admin only)
exports.deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminAccount.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    await admin.destroy();
    res.json({ message: 'Admin account deleted successfully' });
  } catch (error) {
    console.error('Delete admin account error:', error);
    res.status(500).json({ error: 'Failed to delete admin account' });
  }
};
