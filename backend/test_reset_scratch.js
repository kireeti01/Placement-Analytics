const { User, AdminAccount } = require('./src/models');
const { generateToken } = require('./src/config/auth');
const sequelize = require('./src/config/database');

async function testReset() {
  try {
    await sequelize.authenticate();
    
    // 1. Find super admin to generate token
    const superAdmin = await User.findOne({ where: { role: 'super_admin' } });
    if (!superAdmin) {
      console.error('Super admin not found');
      process.exit(1);
    }
    
    const token = generateToken(superAdmin);
    console.log('✅ Generated Super Admin Token:', token);
    
    // 2. Find the admin account
    const admin = await AdminAccount.findOne({ where: { username: 'vlits_admin' } });
    if (!admin) {
      console.error('Admin account not found');
      process.exit(1);
    }
    console.log('✅ Found admin account in DB:', admin.username, 'ID:', admin.id);
    
    // Save old hash
    const oldHash = admin.password_hash;
    
    // 3. Make API request to local server (port 5000)
    console.log('🔄 Sending PUT request to reset password...');
    const newPass = 'College@9999!';
    
    const response = await fetch(
      `http://localhost:5000/api/colleges/admins/${admin.id}/reset-password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPass })
      }
    );
    
    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    // 4. Reload admin from database and verify hash changed
    await admin.reload();
    console.log('🔑 Old password hash:', oldHash);
    console.log('🔑 New password hash:', admin.password_hash);
    
    if (admin.password_hash !== oldHash) {
      console.log('🎉 SUCCESS: Password hash was updated in the database!');
    } else {
      console.error('❌ FAILURE: Password hash did not change in the database!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
}

testReset();
