// Reset admin password (Super Admin only) - FIXED
exports.resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    console.log('Resetting password for admin ID:', id);
    
    if (!newPassword) {
      console.log('No new password provided');
      return res.status(400).json({ error: 'New password is required' });
    }

    // Find the admin account
    const admin = await AdminAccount.findByPk(id);
    if (!admin) {
      console.log('Admin account not found for ID:', id);
      return res.status(404).json({ error: 'Admin account not found' });
    }

    console.log('Admin found:', admin.username);

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await admin.update({ password_hash: hashedPassword });
    
    console.log('Password reset successfully for:', admin.username);
    console.log('New password:', newPassword);
    
    // Send email with new password
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
