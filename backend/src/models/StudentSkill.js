const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentSkill = sequelize.define('StudentSkill', {
  student_id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  skill_id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  proficiency_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    defaultValue: 'intermediate'
  }
}, {
  tableName: 'student_skills',
  timestamps: true
});

module.exports = StudentSkill;
