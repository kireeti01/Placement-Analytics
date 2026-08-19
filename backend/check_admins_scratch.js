const { AdminAccount } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkAdmins() {
  try {
    await sequelize.authenticate();
    const admins = await AdminAccount.findAll();
    console.log('--- ADMIN ACCOUNTS IN DB ---');
    admins.forEach(a => {
      console.log(`ID: ${a.id}`);
      console.log(`Username: ${a.username}`);
      console.log(`Email: ${a.email}`);
      console.log(`Password Hash: ${a.password_hash}`);
      console.log('----------------------------');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error checking admins:', error);
    process.exit(1);
  }
}

checkAdmins();
