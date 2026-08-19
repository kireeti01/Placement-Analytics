const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roll_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Invalid email format',
        args: true
      }
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  batch: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  cgpa: {
    type: DataTypes.DECIMAL(3, 2),
    validate: { min: 0, max: 10 }
  },
  attendance_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  coding_score: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 1000 }
  },
  communication_score: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  projects_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  internships_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  package: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  placement_status: {
    type: DataTypes.ENUM('placed', 'unplaced', 'at_risk', 'in_process'),
    defaultValue: 'in_process'
  },
  predicted_probability: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0, max: 100 }
  },
  highest_offer: {
    type: DataTypes.DECIMAL(10, 2)
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'colleges', key: 'id' }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'students',
  indexes: [
    { fields: ['roll_number', 'college_id'], unique: true }
  ]
});

module.exports = Student;