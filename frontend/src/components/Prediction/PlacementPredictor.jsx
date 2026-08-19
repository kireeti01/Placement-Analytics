import React, { useState, useRef, useEffect } from 'react';
import { Chart, BarController, RadarController, BarElement, PointElement, LineElement, CategoryScale, RadialLinearScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaBrain, FaMagic, FaLightbulb, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Register Chart.js components
Chart.register(BarController, RadarController, BarElement, PointElement, LineElement, CategoryScale, RadialLinearScale, LinearScale, Tooltip, Legend);

const PlacementPredictor = () => {
  const [formData, setFormData] = useState({
    cgpa: '',
    branch: '',
    internships: '',
    coding: '',
    attendance: '',
    projects: '',
    communication: '',
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [result, setResult] = useState(null);
  const featureChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const featureChartInstance = useRef(null);
  const radarChartInstance = useRef(null);

  const skills = [
    { id: 'dsa', label: 'Data Structures' },
    { id: 'web', label: 'Web Development' },
    { id: 'ml', label: 'Machine Learning' },
    { id: 'cloud', label: 'Cloud Computing' },
    { id: 'db', label: 'Database' },
  ];

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  useEffect(() => {
    // Feature Importance Chart
    if (featureChartRef.current) {
      if (featureChartInstance.current) {
        featureChartInstance.current.destroy();
      }
      featureChartInstance.current = new Chart(featureChartRef.current, {
        type: 'bar',
        data: {
          labels: ['CGPA', 'Coding Score', 'Internships', 'Attendance', 'Branch', 'Skills'],
          datasets: [{
            label: 'Importance Score',
            data: [32, 25, 18, 12, 8, 5],
            backgroundColor: ['#00b4d8', '#28a745', '#ffc107', '#6f42c1', '#20c997', '#dc3545'],
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
        },
      });
    }

    // Radar Chart
    if (radarChartRef.current) {
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy();
      }
      radarChartInstance.current = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Academics', 'Coding', 'Projects', 'Communication', 'Internships', 'Attendance'],
          datasets: [
            {
              label: 'Student',
              data: [85, 90, 75, 70, 80, 88],
              borderColor: '#00b4d8',
              backgroundColor: 'rgba(0,180,216,0.2)',
              pointBackgroundColor: '#00b4d8',
            },
            {
              label: 'College Avg',
              data: [70, 65, 60, 68, 55, 75],
              borderColor: '#28a745',
              backgroundColor: 'rgba(40,167,69,0.2)',
              pointBackgroundColor: '#28a745',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { beginAtZero: true, max: 100 } },
        },
      });
    }

    return () => {
      if (featureChartInstance.current) featureChartInstance.current.destroy();
      if (radarChartInstance.current) radarChartInstance.current.destroy();
    };
  }, []);

  const handlePredict = () => {
    const { cgpa, branch, internships, coding, attendance, projects, communication } = formData;
    
    if (!cgpa || !branch) {
      toast.error('Please fill CGPA and Branch!');
      return;
    }

    // Calculate probability
    let probability = 0;
    probability += (parseFloat(cgpa) / 10) * 32;
    probability += (parseInt(coding) || 0) / 1000 * 25;
    probability += (parseInt(internships) || 0) / 3 * 18;
    probability += (parseInt(attendance) || 0) / 100 * 12;
    probability += (parseInt(projects) || 0) / 5 * 8;
    probability += (parseInt(communication) || 0) / 100 * 3;
    
    const branchWeights = { cse: 8, ece: 6, eee: 5, mech: 4, civil: 3 };
    probability += branchWeights[branch] || 0;
    probability += (selectedSkills.length / 5) * 2;
    probability = Math.min(Math.round(probability), 98);

    let resultData = {
      probability,
      label: '',
      description: '',
      color: '',
      readiness: 0,
      recommendations: [],
      companies: [],
    };

    if (probability >= 75) {
      resultData.label = 'Low Risk - High Probability';
      resultData.description = 'Excellent profile! Strong chances of placement.';
      resultData.color = '#28a745';
      resultData.readiness = 85 + Math.floor(Math.random() * 10);
      resultData.recommendations = [
        'Maintain your CGPA above 8.5',
        'Focus on advanced system design',
        'Prepare for dream company interviews',
        'Contribute to open source projects',
      ];
      resultData.companies = ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Goldman Sachs'];
    } else if (probability >= 50) {
      resultData.label = 'Medium Risk - Moderate Probability';
      resultData.description = 'Good profile with room for improvement.';
      resultData.color = '#ffc107';
      resultData.readiness = 60 + Math.floor(Math.random() * 15);
      resultData.recommendations = [
        'Improve coding score to 700+',
        'Get at least 1 internship',
        'Practice mock interviews weekly',
        'Build 2-3 strong projects',
      ];
      resultData.companies = ['TCS', 'Infosys', 'Cognizant', 'Accenture', 'Capgemini'];
    } else {
      resultData.label = 'High Risk - Low Probability';
      resultData.description = 'Needs significant improvement to get placed.';
      resultData.color = '#dc3545';
      resultData.readiness = 30 + Math.floor(Math.random() * 20);
      resultData.recommendations = [
        'Focus on core subjects immediately',
        'Start competitive coding daily',
        'Attend all placement training sessions',
        'Improve attendance to 90%+',
        'Get mentorship from placed seniors',
      ];
      resultData.companies = ['Startups', 'Local IT Firms', 'Service-based Companies'];
    }

    setResult(resultData);
    toast.success(`Prediction completed! Probability: ${probability}%`);
  };

  return (
    <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="prediction-form">
        <div className="chart-header" style={{ marginBottom: '25px' }}>
          <h3><FaBrain style={{ color: 'var(--accent)', marginRight: '8px' }} />Enter Student Profile</h3>
          <span className="view-only-tag"><FaBrain /> Admin only</span>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>CGPA (0-10)</label>
            <input 
              type="number" 
              className="admin-only-field"
              step="0.1" 
              min="0" 
              max="10" 
              placeholder="e.g., 8.5"
              value={formData.cgpa}
              onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <select 
              className="admin-only-field"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
            >
              <option value="">Select Branch</option>
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
              <option value="eee">EEE</option>
              <option value="mech">Mechanical</option>
              <option value="civil">Civil</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Internships</label>
            <select 
              className="admin-only-field"
              value={formData.internships}
              onChange={(e) => setFormData({...formData, internships: e.target.value})}
            >
              <option value="">Select</option>
              <option value="0">None</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
          <div className="form-group">
            <label>Coding Score (0-1000)</label>
            <input 
              type="number" 
              className="admin-only-field"
              min="0" 
              max="1000" 
              placeholder="e.g., 750"
              value={formData.coding}
              onChange={(e) => setFormData({...formData, coding: e.target.value})}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Attendance (%)</label>
            <input 
              type="number" 
              className="admin-only-field"
              min="0" 
              max="100" 
              placeholder="e.g., 85"
              value={formData.attendance}
              onChange={(e) => setFormData({...formData, attendance: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Projects</label>
            <input 
              type="number" 
              className="admin-only-field"
              min="0" 
              max="10" 
              placeholder="e.g., 3"
              value={formData.projects}
              onChange={(e) => setFormData({...formData, projects: e.target.value})}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Communication (0-100)</label>
            <input 
              type="number" 
              className="admin-only-field"
              min="0" 
              max="100" 
              placeholder="e.g., 75"
              value={formData.communication}
              onChange={(e) => setFormData({...formData, communication: e.target.value})}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Key Skills (click to select)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill) => (
              <span
                key={skill.id}
                className={`skill-chip ${selectedSkills.includes(skill.id) ? 'active' : 'inactive'} admin-only`}
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>
        
        <button 
          className="btn btn-primary admin-only" 
          style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}
          onClick={handlePredict}
        >
          <FaMagic /> Predict Placement Probability
        </button>
        
        {result && (
          <div className={`prediction-result show ${result.probability >= 75 ? 'high' : result.probability >= 50 ? 'medium' : 'low'}`}>
            <div className="probability-ring" style={{ background: `conic-gradient(${result.color} ${result.probability}%, #e9ecef ${result.probability}%)` }}>
              <span className="probability-value">{result.probability}%</span>
            </div>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', color: result.color }}>{result.label}</h3>
            <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>{result.description}</p>
            
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6c757d' }}>Readiness Score</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{result.readiness}/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${result.readiness}%`, background: result.color }}></div>
              </div>
            </div>
            
            <div className="recommendations">
              <h4><FaLightbulb style={{ color: 'var(--warning)' }} /> Recommendations</h4>
              <ul>
                {result.recommendations.map((rec, index) => (
                  <li key={index}><i className="fas fa-check-circle"></i> {rec}</li>
                ))}
              </ul>
            </div>
            
            <div className="recommendations" style={{ marginTop: '15px' }}>
              <h4><FaBuilding style={{ color: 'var(--accent)' }} /> Suitable Companies</h4>
              <ul>
                {result.companies.map((company, index) => (
                  <li key={index}><i className="fas fa-building"></i> {company}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Feature Importance</h3>
            <span className="chart-badge">ML Model</span>
          </div>
          <div className="chart-container">
            <canvas ref={featureChartRef}></canvas>
          </div>
        </div>
        
        <div className="chart-card" style={{ marginTop: '20px' }}>
          <div className="chart-header">
            <h3>Student Profile Radar</h3>
            <span className="chart-badge">vs College Average</span>
          </div>
          <div className="chart-container">
            <canvas ref={radarChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPredictor;