const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CollegeRequest = sequelize.define('CollegeRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  college_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  college_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(50)
  },
  pincode: {
    type: DataTypes.STRING(10)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  website: {
    type: DataTypes.STRING(200)
  },
  established_year: {
    type: DataTypes.INTEGER
  },
  admin_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  admin_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { isEmail: true }
  },
  admin_phone: {
    type: DataTypes.STRING(15)
  },
  message: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewed_at: {
    type: DataTypes.DATE
  },
  reviewed_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'college_requests'
});

module.exports = CollegeRequest;
