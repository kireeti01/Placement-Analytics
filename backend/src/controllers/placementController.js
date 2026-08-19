const { Placement, Student, Company } = require('../models');

// Get all placements
exports.getAllPlacements = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'admin' && req.user.college_id) {
      where.college_id = req.user.college_id;
    }

    const placements = await Placement.findAll({
      where,
      include: [
        { model: Student, attributes: ['id', 'name', 'roll_number'] },
        { model: Company, attributes: ['id', 'name', 'tier'] }
      ],
      order: [['offer_date', 'DESC']]
    });
    res.json(placements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
};

// Create placement
exports.createPlacement = async (req, res) => {
  try {
    const data = req.body;
    
    if (req.user.role === 'admin') {
      data.college_id = req.user.college_id;
    }

    const placement = await Placement.create(data);
    res.status(201).json(placement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create placement' });
  }
};

// Update placement
exports.updatePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByPk(req.params.id);
    if (!placement) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    await placement.update(req.body);
    res.json(placement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update placement' });
  }
};

// Delete placement
exports.deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByPk(req.params.id);
    if (!placement) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    await placement.destroy();
    res.json({ message: 'Placement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete placement' });
  }
};

// Get placement statistics
exports.getPlacementStats = async (req, res) => {
  try {
    const collegeId = req.user.role === 'super_admin' ? null : req.user.college_id;
    const where = collegeId ? { college_id: collegeId } : {};

    const placements = await Placement.findAll({ where });
    
    const total = placements.length;
    const avgPackage = total > 0 
      ? placements.reduce((sum, p) => sum + parseFloat(p.package_amount), 0) / total 
      : 0;

    // Company-wise stats
    const companies = {};
    placements.forEach(p => {
      if (!companies[p.company_id]) {
        companies[p.company_id] = { count: 0, totalPackage: 0 };
      }
      companies[p.company_id].count++;
      companies[p.company_id].totalPackage += parseFloat(p.package_amount);
    });

    const companyStats = Object.keys(companies).map(key => ({
      company_id: key,
      count: companies[key].count,
      avgPackage: companies[key].totalPackage / companies[key].count
    }));

    res.json({
      total,
      avgPackage: avgPackage.toFixed(2),
      companyStats,
      totalOffers: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get placement stats' });
  }
};
