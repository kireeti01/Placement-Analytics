const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const AdminAccount = sequelize.define('AdminAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { isEmail: true }
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'colleges', key: 'id' }
  },
  college_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'admin_accounts',
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password_hash && !admin.password_hash.startsWith('$') && !admin.password_hash.startsWith('$')) {
        const salt = await bcrypt.genSalt(10);
        admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
        console.log('✅ Admin password hashed for:', admin.username);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password_hash') && 
          admin.password_hash && 
          !admin.password_hash.startsWith('$') && 
          !admin.password_hash.startsWith('$')) {
        const salt = await bcrypt.genSalt(10);
        admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
        console.log('✅ Admin password updated for:', admin.username);
      }
    }
  }
});

AdminAccount.prototype.validatePassword = async function(password) {
  try {
    console.log('🔐 Validating admin password for:', this.username);
    console.log('🔐 Password hash starts with:', this.password_hash.substring(0, 10));
    const result = await bcrypt.compare(password, this.password_hash);
    console.log('✅ Password match result:', result);
    return result;
  } catch (error) {
    console.error('❌ Password validation error:', error);
    return false;
  }
};

AdminAccount.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = AdminAccount;
