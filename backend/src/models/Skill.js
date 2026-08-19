const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Skill = sequelize.define('Skill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'skills'
});

module.exports = Skill;
