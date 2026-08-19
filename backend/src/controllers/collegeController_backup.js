const { College, User, CollegeRequest, AdminAccount } = require('../models');

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

    console.log('✅ Registration request created:', request.id);
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
    const request = await CollegeRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Create college
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

    // Update request status
    await request.update({
      status: 'approved',
      reviewed_at: new Date(),
      reviewed_by: req.user.id
    });

    // Generate admin credentials
    const username = request.college_code.toLowerCase() + '_admin';
    const password = 'College@' + Math.floor(Math.random() * 10000) + '!';

    // Create admin account in database
    const adminAccount = await AdminAccount.create({
      username: username,
      password_hash: password,
      email: request.admin_email,
      college_id: college.id,
      college_name: college.name,
      created_by: req.user.id,
      is_active: true
    });

    console.log('✅ College approved:', college.name);
    console.log('✅ Admin account created:', username);

    // Send credentials email
    await sendCredentialsEmail(
      request.admin_email,
      username,
      password,
      college.name
    );

    res.json({
      message: 'College approved and admin created',
      college,
      credentials: {
        username,
        password,
        email: request.admin_email
      }
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
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

    console.log('❌ College rejected:', request.college_name);
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
    console.log('📋 Pending requests count:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

// Get all requests (Super Admin only) - FIXED
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await CollegeRequest.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log('📋 All requests count:', requests.length);
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
    const { username, password, email, college_id, college_name } = req.body;

    const existing = await AdminAccount.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const adminAccount = await AdminAccount.create({
      username,
      password_hash: password,
      email,
      college_id,
      college_name,
      created_by: req.user.id,
      is_active: true
    });

    // Send email with credentials
    await sendCredentialsEmail(email, username, password, college_name);

    res.status(201).json({
      message: 'Admin account created',
      account: adminAccount.toJSON()
    });
  } catch (error) {
    console.error('Create admin account error:', error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
};

// Reset admin password (Super Admin only)
exports.resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const admin = await AdminAccount.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    await admin.update({ password_hash: newPassword });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
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
