const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'colleges', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('placement', 'branch', 'company', 'student', 'nba', 'naac'),
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB
  },
  file_url: {
    type: DataTypes.STRING(500)
  },
  file_format: {
    type: DataTypes.ENUM('pdf', 'excel', 'csv', 'json')
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'reports'
});

module.exports = Report;
