const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const College = sequelize.define('College', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
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
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'colleges'
});

module.exports = College;
