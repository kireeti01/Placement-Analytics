// Approve College Request (Super Admin only) - FIXED
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

    // Generate admin credentials
    const username = request.college_code.toLowerCase() + '_admin';
    const password = 'College@' + Math.floor(Math.random() * 10000) + '!';

    // Check if admin account already exists
    const existingAdmin = await AdminAccount.findOne({ where: { username } });
    if (existingAdmin) {
      // If exists, generate a new username with timestamp
      const newUsername = request.college_code.toLowerCase() + '_admin_' + Date.now();
      console.log('⚠️ Username ' + username + ' already exists, using: ' + newUsername);
      
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

      // Create admin account with new username
      const adminAccount = await AdminAccount.create({
        username: newUsername,
        password_hash: password,
        email: request.admin_email,
        college_id: college.id,
        college_name: college.name,
        created_by: req.user.id,
        is_active: true
      });

      console.log('✅ College approved:', college.name);
      console.log('✅ Admin account created:', newUsername);

      res.json({
        message: 'College approved and admin created',
        college,
        credentials: {
          username: newUsername,
          password,
          email: request.admin_email
        }
      });
      return;
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

    // Create admin account
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
    try {
      await sendCredentialsEmail(
        request.admin_email,
        username,
        password,
        college.name
      );
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      // Continue even if email fails
    }

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
    res.status(500).json({ error: 'Failed to approve request: ' + error.message });
  }
};
