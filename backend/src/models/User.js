const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'parent', 'student'),
    defaultValue: 'student'
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'colleges', key: 'id' }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      // Only hash if password_hash is not already hashed (starts with $ or $)
      if (user.password_hash && !user.password_hash.startsWith('$') && !user.password_hash.startsWith('$')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
        console.log('Password hashed for:', user.username);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && !user.password_hash.startsWith('$') && !user.password_hash.startsWith('$')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
        console.log('Password updated for:', user.username);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  console.log('🔐 Validating password for:', this.username);
  const result = await bcrypt.compare(password, this.password_hash);
  console.log('✅ Password match:', result);
  return result;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;
