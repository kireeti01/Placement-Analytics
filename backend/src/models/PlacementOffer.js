const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlacementOffer = sequelize.define('PlacementOffer', {
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
  package_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  offer_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'placement_offers'
});

module.exports = PlacementOffer;
