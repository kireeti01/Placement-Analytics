const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Placement = sequelize.define('Placement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'companies', key: 'id' }
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'colleges', key: 'id' }
  },
  package_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  package_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  offer_date: {
    type: DataTypes.DATE
  },
  joining_date: {
    type: DataTypes.DATE
  },
  position: {
    type: DataTypes.STRING(100)
  },
  location: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('offered', 'accepted', 'rejected', 'joined'),
    defaultValue: 'offered'
  },
  is_dream_offer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'placements'
});

module.exports = Placement;
