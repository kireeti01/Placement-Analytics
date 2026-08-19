const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const College = require('./College');
const User = require('./User');
const Student = require('./Student');
const Placement = require('./Placement');
const Company = require('./Company');
const AdminAccount = require('./AdminAccount');
const CollegeRequest = require('./CollegeRequest');

// Define associations
College.hasMany(User, { foreignKey: 'college_id' });
User.belongsTo(College, { foreignKey: 'college_id' });

College.hasMany(Student, { foreignKey: 'college_id' });
Student.belongsTo(College, { foreignKey: 'college_id' });

User.hasMany(Student, { foreignKey: 'created_by' });
Student.belongsTo(User, { foreignKey: 'created_by' });

College.hasMany(AdminAccount, { foreignKey: 'college_id' });
AdminAccount.belongsTo(College, { foreignKey: 'college_id' });

User.hasMany(AdminAccount, { foreignKey: 'created_by' });
AdminAccount.belongsTo(User, { foreignKey: 'created_by' });

// Company associations
Company.hasMany(Placement, { foreignKey: 'company_id' });
Placement.belongsTo(Company, { foreignKey: 'company_id' });

Student.hasMany(Placement, { foreignKey: 'student_id' });
Placement.belongsTo(Student, { foreignKey: 'student_id' });

College.hasMany(Placement, { foreignKey: 'college_id' });
Placement.belongsTo(College, { foreignKey: 'college_id' });

module.exports = {
  sequelize,
  College,
  CollegeRequest,
  User,
  Student,
  Placement,
  Company,
  AdminAccount
};
