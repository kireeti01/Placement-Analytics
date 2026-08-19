// Approve College Request (Super Admin only) - IMPROVED VERSION
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Approving request:', id);
    
    const request = await CollegeRequest.findByPk(id);
    
    if (!request) {
      console.log('❌ Request not found:', id);
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      console.log('❌ Request already processed, status:', request.status);
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Check if college code already exists
    const existingCollege = await College.findOne({ where: { code: request.college_code } });
    if (existingCollege) {
      console.log('❌ College code already exists:', request.college_code);
      return res.status(400).json({ error: 'College code already exists' });
    }

    // Generate admin credentials with unique username
    let baseUsername = request.college_code.toLowerCase() + '_admin';
    let finalUsername = baseUsername;
    let counter = 1;
    
    // Check if username exists in either table and find a unique one
    let existingAdmin = await AdminAccount.findOne({ where: { username: finalUsername } });
    let existingUser = await User.findOne({ where: { username: finalUsername } });
    
    while (existingAdmin || existingUser) {
      finalUsername = baseUsername + '_' + counter;
      counter++;
      existingAdmin = await AdminAccount.findOne({ where: { username: finalUsername } });
      existingUser = await User.findOne({ where: { username: finalUsername } });
      console.log('⚠️ Username exists, trying:', finalUsername);
    }
    
    console.log('✅ Unique username found:', finalUsername);

    // Generate password
    const plainPassword = 'College@' + Math.floor(Math.random() * 10000) + '!';
    
    // Hash the password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

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

    console.log('✅ College created:', college.id);

    // Update request status
    await request.update({
      status: 'approved',
      reviewed_at: new Date(),
      reviewed_by: req.user.id
    });

    console.log('✅ Request updated to approved');

    // Create admin account with hashed password
    const adminAccount = await AdminAccount.create({
      username: finalUsername,
      password_hash: hashedPassword,
      email: request.admin_email,
      college_id: college.id,
      college_name: college.name,
      created_by: req.user.id,
      is_active: true
    });

    console.log('✅ Admin account created:', finalUsername);
    console.log('✅ Password (plain):', plainPassword);

    // Send credentials email
    try {
      await sendCredentialsEmail(
        request.admin_email,
        finalUsername,
        plainPassword,
        college.name
      );
      console.log('✅ Email sent to:', request.admin_email);
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
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
    console.error('❌ Approval error:', error);
    res.status(500).json({ error: 'Failed to approve request: ' + error.message });
  }
};
