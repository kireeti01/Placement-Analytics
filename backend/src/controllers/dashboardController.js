const { Student, Placement, Company } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const collegeId = req.user.role === 'super_admin' ? null : req.user.college_id;
    const where = collegeId ? { college_id: collegeId } : {};

    // Student stats
    const totalStudents = await Student.count({ where });
    const placedStudents = await Student.count({ where: { ...where, placement_status: 'placed' } });
    const unplacedStudents = await Student.count({ where: { ...where, placement_status: 'unplaced' } });
    const atRiskStudents = await Student.count({ where: { ...where, placement_status: 'at_risk' } });

    const placementRate = totalStudents > 0 
      ? ((placedStudents / totalStudents) * 100).toFixed(1) 
      : 0;

    // Placement stats
    const placementWhere = collegeId ? { college_id: collegeId } : {};
    const placements = await Placement.findAll({ where: placementWhere });
    let totalOffers = placements.length;
    let avgPackage = 0;
    let highestPackage = 0;

    if (totalOffers > 0) {
      const placementPackages = placements
        .map(p => parseFloat(p.package_amount))
        .filter(n => !isNaN(n));
      if (placementPackages.length > 0) {
        avgPackage = (placementPackages.reduce((sum, p) => sum + p, 0) / placementPackages.length).toFixed(1);
        highestPackage = Math.max(...placementPackages).toFixed(1);
      }
    }

    if (totalOffers === 0) {
      const placedStudents = await Student.findAll({
        where: {
          ...where,
          placement_status: 'placed',
          package: { [Op.ne]: null }
        }
      });
      const studentPackages = placedStudents
        .map(s => parseFloat(s.package?.replace(/[^0-9.]/g, '')))
        .filter(n => !isNaN(n));
      if (studentPackages.length > 0) {
        totalOffers = studentPackages.length;
        avgPackage = (studentPackages.reduce((sum, p) => sum + p, 0) / studentPackages.length).toFixed(1);
        highestPackage = Math.max(...studentPackages).toFixed(1);
      }
    }

    // Branch-wise stats
    const branchStats = await Student.findAll({
      where,
      attributes: [
        'branch',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN placement_status = 'placed' THEN 1 ELSE 0 END")), 'placed']
      ],
      group: ['branch']
    });

    res.json({
      stats: {
        totalStudents,
        placedStudents,
        unplacedStudents,
        atRiskStudents,
        placementRate,
        totalOffers,
        avgPackage: avgPackage + ' LPA',
        highestPackage: highestPackage + ' LPA'
      },
      branchStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

exports.getTrendData = async (req, res) => {
  try {
    // For demo, returning static trend data
    // In production, this would query historical data
    res.json({
      years: ['2021', '2022', '2023', '2024', '2025'],
      placementRates: [68, 72, 75, 78, 82],
      avgPackages: [5.2, 5.8, 6.5, 7.2, 8.4]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trend data' });
  }
};
