const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true
  },
  industry: {
    type: DataTypes.STRING(50)
  },
  tier: {
    type: DataTypes.ENUM('dream', 'good', 'entry'),
    defaultValue: 'good'
  },
  website: {
    type: DataTypes.STRING(200)
  },
  description: {
    type: DataTypes.TEXT
  },
  headquarters: {
    type: DataTypes.STRING(200)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'companies'
});

module.exports = Company;
