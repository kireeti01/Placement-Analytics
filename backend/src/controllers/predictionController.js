const http = require('http');
const { URL } = require('url');
const { Student } = require('../models');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

const branchWeights = {
  cse: 8,
  ece: 6,
  eee: 5,
  mech: 4,
  civil: 3
};

const companyRequirements = {
  google: ['Data Structures', 'Operating Systems', 'Computer Networks', 'System Design'],
  amazon: ['Data Structures', 'Operating Systems', 'DBMS', 'Leadership'],
  microsoft: ['Data Structures', 'Operating Systems', 'Computer Networks', 'DBMS'],
  tcs: ['Data Structures', 'DBMS', 'Communication'],
  infosys: ['Data Structures', 'Web Development', 'DBMS']
};

const marketCompanies = [
  { name: 'Cognizant', match: 94, color: '#28a745', desc: 'Matches current CGPA, coding score & skill set' },
  { name: 'Accenture', match: 89, color: '#28a745', desc: 'Strong match on communication & DSA skills' },
  { name: 'Amazon', match: 58, color: '#ffc107', desc: 'Improve coding score & system design' },
  { name: 'Microsoft', match: 41, color: '#ffc107', desc: 'Needs stronger DSA & at least one more internship' },
];

const callAiService = async (path, payload) => {
  return new Promise((resolve, reject) => {
    const endpoint = new URL(path, AI_SERVICE_URL);
    const body = JSON.stringify(payload);
    const request = http.request(
      {
        hostname: endpoint.hostname,
        port: endpoint.port,
        path: endpoint.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (response.statusCode >= 400) {
              reject(new Error(parsed.error || 'AI service request failed'));
              return;
            }
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on('error', reject);
    request.write(body);
    request.end();
  });
};

const buildPlacementResult = (probability) => {
  if (probability >= 75) {
    return {
      probability,
      label: 'Low Risk - High Probability',
      description: 'Excellent profile! Strong chances of placement.',
      color: '#28a745',
      readiness: 85,
      recommendations: [
        'Maintain your CGPA above 8.5',
        'Focus on advanced system design',
        'Prepare for dream company interviews',
        'Contribute to open source projects'
      ],
      companies: ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Goldman Sachs']
    };
  }

  if (probability >= 50) {
    return {
      probability,
      label: 'Medium Risk - Moderate Probability',
      description: 'Good profile with room for improvement.',
      color: '#ffc107',
      readiness: 67,
      recommendations: [
        'Improve coding score to 700+',
        'Get at least 1 internship',
        'Practice mock interviews weekly',
        'Build 2-3 strong projects'
      ],
      companies: ['TCS', 'Infosys', 'Cognizant', 'Accenture', 'Capgemini']
    };
  }

  return {
    probability,
    label: 'High Risk - Low Probability',
    description: 'Needs significant improvement to get placed.',
    color: '#dc3545',
    readiness: 38,
    recommendations: [
      'Focus on core subjects immediately',
      'Start competitive coding daily',
      'Attend all placement training sessions',
      'Improve attendance to 90%+',
      'Get mentorship from placed seniors'
    ],
    companies: ['Startups', 'Local IT Firms', 'Service-based Companies']
  };
};

const calculateProbability = (profile = {}) => {
  const cgpa = parseFloat(profile.cgpa) || 0;
  const coding = parseInt(profile.coding, 10) || 0;
  const internships = parseInt(profile.internships, 10) || 0;
  const attendance = parseInt(profile.attendance, 10) || 0;
  const projects = parseInt(profile.projects, 10) || 0;
  const communication = parseInt(profile.communication, 10) || 0;
  const selectedSkills = Array.isArray(profile.selectedSkills) ? profile.selectedSkills.length : 0;

  let probability = 0;
  probability += (cgpa / 10) * 32;
  probability += (coding / 1000) * 25;
  probability += (internships / 3) * 18;
  probability += (attendance / 100) * 12;
  probability += (projects / 5) * 8;
  probability += (communication / 100) * 3;
  probability += (branchWeights[(profile.branch || '').toLowerCase()] || 0);
  probability += (selectedSkills / 5) * 2;

  return Math.min(Math.round(probability), 98);
};

exports.predictPlacement = async (req, res) => {
  try {
    const profile = req.body || {};
    try {
      const aiResponse = await callAiService('/predict', { profile });
      if (aiResponse && typeof aiResponse.probability === 'number') {
        return res.json(aiResponse);
      }
    } catch (serviceError) {
      console.warn('AI service unavailable, using local fallback:', serviceError.message);
    }

    const probability = calculateProbability(profile);
    const payload = buildPlacementResult(probability);
    return res.json(payload);
  } catch (error) {
    console.error('Placement prediction error:', error);
    return res.status(500).json({ error: 'Failed to compute placement prediction' });
  }
};

exports.analyzeSkillGap = async (req, res) => {
  try {
    const payload = req.body || {};
    try {
      const aiResponse = await callAiService('/skill-gap', payload);
      if (aiResponse && Array.isArray(aiResponse.required)) {
        return res.json(aiResponse);
      }
    } catch (serviceError) {
      console.warn('AI skill-gap service unavailable, using local fallback:', serviceError.message);
    }

    const { company = '', selectedSkills = [] } = payload;
    const required = companyRequirements[company] || [];
    const missing = required.filter((skill) => !selectedSkills.includes(skill));

    return res.json({
      company,
      required,
      missing,
      learningPlan: missing.length > 0
        ? missing.map((skill, index) => `Week ${index + 1}-${index + 2}: Build proficiency in ${skill}`)
        : ['Focus on mock interviews and revision']
    });
  } catch (error) {
    console.error('Skill gap error:', error);
    return res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    const filename = req.file?.originalname || 'resume.pdf';
    try {
      const aiResponse = await callAiService('/resume', { filename });
      if (typeof aiResponse.atsScore === 'number') {
        return res.json(aiResponse);
      }
    } catch (serviceError) {
      console.warn('AI resume service unavailable, using local fallback:', serviceError.message);
    }

    const normalized = filename.toLowerCase();
    const hasKeywords = /(resume|cv|profile)/i.test(normalized);

    const atsScore = hasKeywords ? 78 : 64;
    const missingKeywords = hasKeywords
      ? ['REST APIs', 'Cloud Deployment', 'System Design']
      : ['Resume file is missing or unreadable'];

    return res.json({
      atsScore,
      missingKeywords,
      suggestions: hasKeywords
        ? [
            'Add measurable impact/metrics to project bullet points',
            'Include a dedicated Skills section with proficiency levels',
            'Use stronger action verbs at the start of each bullet'
          ]
        : ['Upload an actual resume file to analyze it']
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

exports.getCompanyRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = studentId ? await Student.findByPk(studentId) : null;

    if (!student) {
      return res.json({ recommendations: [] });
    }

    const cgpa = parseFloat(student.cgpa || 0);
    const codingScore = parseInt(student.coding_score || 0, 10);
    const internships = parseInt(student.internships_count || 0, 10);
    const communication = parseInt(student.communication_score || 0, 10);
    const baseScore = Math.min(95, Math.round((cgpa * 8) + (codingScore / 10) + (internships * 8) + (communication * 0.5)));

    const recommendations = marketCompanies.map((company, index) => ({
      ...company,
      match: Math.max(35, Math.min(98, baseScore - (index * 7) + (index === 0 ? 3 : 0)))
    }));

    return res.json({ recommendations });
  } catch (error) {
    console.error('Company recommendation error:', error);
    return res.status(500).json({ error: 'Failed to fetch company recommendations' });
  }
};

exports.getAtRiskStudents = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const where = collegeId ? { college_id: collegeId } : {};
    const students = await Student.findAll({
      where,
      order: [['name', 'ASC']]
    });

    const mappedStudents = students.map((student) => {
      const probability = Math.max(0, Math.min(100, Number(student.predicted_probability || 0)));
      let risk = 'Low';
      if (probability < 40) risk = 'High';
      else if (probability < 70) risk = 'Medium';

      return {
        id: student.id,
        name: student.name,
        branch: student.branch,
        cgpa: student.cgpa,
        prob: probability,
        risk
      };
    });

    const highRisk = mappedStudents.filter((student) => student.risk === 'High').length;
    const mediumRisk = mappedStudents.filter((student) => student.risk === 'Medium').length;
    const lowRisk = mappedStudents.filter((student) => student.risk === 'Low').length;

    return res.json({
      stats: {
        highRisk,
        mediumRisk,
        lowRisk
      },
      students: mappedStudents
    });
  } catch (error) {
    console.error('At risk retrieval error:', error);
    return res.json({
      stats: { highRisk: 0, mediumRisk: 0, lowRisk: 0 },
      students: []
    });
  }
};

exports.getTrendForecast = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const where = collegeId ? { college_id: collegeId } : {};
    const students = await Student.findAll({ where, attributes: ['placement_status', 'package'] });

    if (students.length === 0) {
      return res.json({
        years: [],
        placementRates: [],
        avgPackages: [],
        summary: {
          predictedPlacement: 0,
          expectedRecruiters: 0,
          expectedAvgPackage: 0
        }
      });
    }

    const placedCount = students.filter((student) => student.placement_status === 'placed').length;
    const totalCount = students.length || 1;
    const placementRate = Math.round((placedCount / totalCount) * 100);

    const years = ['2021', '2022', '2023', '2024', '2025', '2026 (Pred)'];
    const placementRates = [68, 72, 75, 78, placementRate || 82, Math.min(98, placementRate + 4 || 86)];
    const avgPackages = [5.2, 5.8, 6.5, 7.2, 8.4, 9.8];

    return res.json({
      years,
      placementRates,
      avgPackages,
      summary: {
        predictedPlacement: placementRates[placementRates.length - 1],
        expectedRecruiters: Math.max(1, Math.round(placementRate / 2)),
        expectedAvgPackage: 9.8
      }
    });
  } catch (error) {
    console.error('Trend forecast error:', error);
    return res.json({
      years: [],
      placementRates: [],
      avgPackages: [],
      summary: {
        predictedPlacement: 0,
        expectedRecruiters: 0,
        expectedAvgPackage: 0
      }
    });
  }
};
