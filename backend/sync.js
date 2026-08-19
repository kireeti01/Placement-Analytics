const { sequelize } = require('./src/models');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

async function syncDatabase() {
  try {
    // SAFE sync: creates missing tables / adds missing columns.
    // Never wipes existing data (force:true used to drop everything).
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully (no data was deleted).');

    const { User } = require('./src/models');

    // Only create the super admin if one doesn't already exist
    const existing = await User.findOne({ where: { username: 'superadmin' } });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('super123', 10);
      const superAdmin = await User.create({
        username: 'superadmin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@campusplacement.ai',
        password_hash: hashedPassword,
        role: 'super_admin',
        is_active: true
      });
      console.log('✅ Super Admin created:');
      console.log('  Username: superadmin');
      console.log('  Password: super123');
      console.log('  ID:', superAdmin.id);
    } else {
      console.log('ℹ️ Super Admin already exists — skipped creating a duplicate.');
    }

    console.log('✅ Database ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();
