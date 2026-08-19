const { Company } = require('../models');

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['name', 'ASC']]
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// Create company
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await company.update(req.body);
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

// Get company statistics
exports.getCompanyStats = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { is_active: true },
      include: [
        {
          model: Placement,
          attributes: ['package_amount', 'status']
        }
      ]
    });

    const stats = companies.map(company => {
      const placements = company.Placements || [];
      const offered = placements.filter(p => p.status === 'offered' || p.status === 'accepted' || p.status === 'joined');
      const avgPackage = offered.length > 0 
        ? offered.reduce((sum, p) => sum + parseFloat(p.package_amount), 0) / offered.length 
        : 0;
      
      return {
        id: company.id,
        name: company.name,
        tier: company.tier,
        totalOffers: offered.length,
        avgPackage: avgPackage.toFixed(2)
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get company stats' });
  }
};
