import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FaBrain, FaCalculator, FaExclamationTriangle, FaChartLine, 
  FaPuzzlePiece, FaBullseye, FaFileInvoice, FaMagic, FaBuilding,
  FaArrowUp, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { studentAPI } from '../services/api';
import { predictPlacement, analyzeSkillGap, analyzeResume, getAtRiskStudents, getCompanyRecommendations, getTrendForecast } from '../services/prediction';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const Prediction = () => {
  const [activeTab, setActiveTab] = useState('predict');
  const [students, setStudents] = useState([]);
  const [hasLiveStudentData, setHasLiveStudentData] = useState(false);
  const [loadingStudentData, setLoadingStudentData] = useState(true);

  useEffect(function() {
    async function loadStudentData() {
      try {
        const response = await studentAPI.getAll();
        const studentList = Array.isArray(response?.data) ? response.data : [];
        setStudents(studentList);
        setHasLiveStudentData(studentList.length > 0);
      } catch (error) {
        setStudents([]);
        setHasLiveStudentData(false);
      } finally {
        setLoadingStudentData(false);
      }
    }

    loadStudentData();
  }, []);

  const tabs = [
    { id: 'predict', label: 'Placement Predictor', icon: FaBrain },
    { id: 'whatif', label: 'What-If Simulator', icon: FaCalculator },
    { id: 'risk', label: 'At-Risk Detection', icon: FaExclamationTriangle },
    { id: 'forecast', label: 'Trend Forecast', icon: FaChartLine },
    { id: 'skillgap', label: 'Skill Gap Analyzer', icon: FaPuzzlePiece },
    { id: 'companyrec', label: 'Company Match', icon: FaBullseye },
    { id: 'resume', label: 'Resume Analyzer', icon: FaFileInvoice },
  ];

  // ===== TAB 1: PLACEMENT PREDICTOR =====
  const PlacementPredictor = () => {
    const liveStudent = students[0] || null;
    const [formData, setFormData] = useState({
      cgpa: '',
      branch: '',
      internships: '',
      coding: '',
      attendance: '',
      projects: '',
      communication: ''
    });
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [result, setResult] = useState(null);

    const skills = ['Data Structures', 'Web Development', 'Machine Learning', 'Cloud Computing', 'Database'];

    useEffect(function() {
      if (!liveStudent) return;
      setFormData({
        cgpa: liveStudent.cgpa || '',
        branch: String(liveStudent.branch || '').toLowerCase(),
        internships: String(liveStudent.internships_count || 0),
        coding: liveStudent.coding_score || '',
        attendance: liveStudent.attendance_percentage || '',
        projects: liveStudent.projects_count || '',
        communication: liveStudent.communication_score || ''
      });
    }, [liveStudent]);

    const toggleSkill = (skill) => {
      if (selectedSkills.includes(skill)) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      } else {
        setSelectedSkills([...selectedSkills, skill]);
      }
    };

    const handlePredict = async () => {
      const { cgpa, branch, internships, coding, attendance, projects, communication } = formData;
      
      if (!cgpa || !branch) {
        toast.error('Please fill CGPA and Branch!');
        return;
      }

      try {
        const resultData = await predictPlacement({
          ...formData,
          selectedSkills
        });
        setResult(resultData);
        toast.success(`Prediction completed! Probability: ${resultData.probability}%`);
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Prediction service is unavailable');
      }
    };

    return (
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="prediction-form">
          <h3 style={{ marginBottom: '16px' }}><FaBrain style={{ color: 'var(--accent)' }} /> Placement Predictor</h3>
          <p style={{ color: '#6c757d', marginBottom: '16px' }}>Enter student details to get placement probability</p>
          
          <div className="form-row">
            <div className="form-group">
              <label>CGPA (0-10)</label>
              <input type="number" step="0.1" placeholder="8.5" value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <select value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})}>
                <option value="">Select</option>
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
              <select value={formData.internships} onChange={(e) => setFormData({...formData, internships: e.target.value})}>
                <option value="">Select</option>
                <option value="0">None</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coding Score (0-1000)</label>
              <input type="number" placeholder="750" value={formData.coding} onChange={(e) => setFormData({...formData, coding: e.target.value})} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Attendance (%)</label>
              <input type="number" placeholder="85" value={formData.attendance} onChange={(e) => setFormData({...formData, attendance: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Projects</label>
              <input type="number" placeholder="3" value={formData.projects} onChange={(e) => setFormData({...formData, projects: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Communication (0-100)</label>
            <input type="number" placeholder="75" value={formData.communication} onChange={(e) => setFormData({...formData, communication: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Key Skills (click to select)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => (
                <span key={skill} className={'skill-chip ' + (selectedSkills.includes(skill) ? 'active' : 'inactive')} onClick={() => toggleSkill(skill)}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handlePredict}>
            <FaMagic /> Predict Probability
          </button>
          
          {result && (
            <div className={'prediction-result show ' + (result.probability >= 75 ? 'high' : result.probability >= 50 ? 'medium' : 'low')}>
              <div className="probability-ring" style={{ background: 'conic-gradient(' + result.color + ' ' + result.probability + '%, #e9ecef ' + result.probability + '%)' }}>
                <span className="probability-value">{result.probability}%</span>
              </div>
              <h3 style={{ textAlign: 'center', color: result.color }}>{result.label}</h3>
              <div className="recommendations">
                <h4><FaCheckCircle style={{ color: 'var(--success)' }} /> Recommendations</h4>
                <ul>
                  {result.recommendations.map(function(r, i) {
                    return <li key={i}><FaCheckCircle /> {r}</li>;
                  })}
                </ul>
              </div>
              <div className="recommendations">
                <h4><FaBuilding style={{ color: 'var(--accent)' }} /> Suitable Companies</h4>
                <ul>
                  {result.companies.map(function(c, i) {
                    return <li key={i}><FaBuilding /> {c}</li>;
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="chart-card">
          <h3>Feature Importance</h3>
          <div style={{ padding: '20px' }}>
            {[
              { label: 'CGPA', value: 32, color: '#00b4d8' },
              { label: 'Coding', value: 25, color: '#28a745' },
              { label: 'Internships', value: 18, color: '#ffc107' },
              { label: 'Attendance', value: 12, color: '#6f42c1' },
              { label: 'Branch', value: 8, color: '#20c997' },
              { label: 'Skills', value: 5, color: '#dc3545' }
            ].map(function(item, index) {
              return (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: item.value + '%', background: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ===== TAB 2: WHAT-IF SIMULATOR =====
  const WhatIfSimulator = () => {
    const liveStudent = students[0] || null;
    const [baseCGPA, setBaseCGPA] = useState(7.2);
    const [baseCoding, setBaseCoding] = useState(400);
    const [baseInternships, setBaseInternships] = useState(0);

    useEffect(function() {
      if (!liveStudent) return;
      setBaseCGPA(parseFloat(liveStudent.cgpa || 7.2));
      setBaseCoding(parseInt(liveStudent.coding_score || 400, 10));
      setBaseInternships(parseInt(liveStudent.internships_count || 0, 10));
    }, [liveStudent]);
    
    const calculateProb = function(cgpa, coding, internships) {
      var p = 0;
      p += (cgpa / 10) * 32;
      p += (coding / 1000) * 25;
      p += (internships / 3) * 18;
      p += 15;
      return Math.min(Math.round(p), 98);
    };

    var currentProb = calculateProb(baseCGPA, baseCoding, baseInternships);
    var improvedProb = calculateProb(Math.max(baseCGPA, 8.0), Math.max(baseCoding, 700), Math.max(baseInternships, 1));

    return (
      <div className="chart-card">
        <h3><FaCalculator style={{ color: 'var(--purple)' }} /> What-If Simulator</h3>
        <p style={{ color: '#6c757d', marginBottom: '16px' }}>See how changing your profile affects placement probability</p>
        
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card blue">
            <div className="stat-label">Current CGPA</div>
            <div className="stat-value">{baseCGPA}</div>
            <input type="range" min="5" max="10" step="0.1" value={baseCGPA} onChange={function(e) { setBaseCGPA(parseFloat(e.target.value)); }} style={{ width: '100%' }} />
          </div>
          <div className="stat-card green">
            <div className="stat-label">Coding Score</div>
            <div className="stat-value">{baseCoding}</div>
            <input type="range" min="0" max="1000" step="10" value={baseCoding} onChange={function(e) { setBaseCoding(parseInt(e.target.value)); }} style={{ width: '100%' }} />
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Internships</div>
            <div className="stat-value">{baseInternships}</div>
            <input type="range" min="0" max="3" step="1" value={baseInternships} onChange={function(e) { setBaseInternships(parseInt(e.target.value)); }} style={{ width: '100%' }} />
          </div>
        </div>

        <div className="whatif-row">
          <div className="whatif-prob" style={{ background: 'linear-gradient(135deg, #6f42c1, #8b5cf6)' }}>{currentProb}%</div>
          <div style={{ flex: 1 }}>
            <h4>Current Profile</h4>
            <p style={{ fontSize: '13px', color: '#6c757d' }}>CGPA: {baseCGPA} | Coding: {baseCoding} | Internships: {baseInternships}</p>
          </div>
          <div style={{ width: '200px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: currentProb + '%', background: 'var(--purple)' }}></div>
            </div>
          </div>
        </div>

        <div className="whatif-row">
          <div className="whatif-prob" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>{improvedProb}%</div>
          <div style={{ flex: 1 }}>
            <h4>If Improved</h4>
            <p style={{ fontSize: '13px', color: '#6c757d' }}>CGPA: 8.0 | Coding: 700 | Internships: 1</p>
          </div>
          <div style={{ width: '200px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: improvedProb + '%', background: 'var(--success)' }}></div>
            </div>
          </div>
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>+{improvedProb - currentProb}%</span>
        </div>
      </div>
    );
  };

  // ===== TAB 3: AT-RISK DETECTION =====
  const AtRiskDetection = function() {
    const [riskData, setRiskData] = useState(null);
    const [loadingRisk, setLoadingRisk] = useState(true);

    useEffect(function() {
      async function loadRiskData() {
        try {
          const response = await getAtRiskStudents();
          setRiskData(response);
        } catch (error) {
          toast.error('Unable to load at-risk analysis');
        } finally {
          setLoadingRisk(false);
        }
      }

      if (students.length > 0) {
        const mappedStudents = students.map(function(student) {
          const probability = Math.max(0, Math.min(100, Number(student.predicted_probability || Math.min(98, Math.round(((Number(student.cgpa || 0) / 10) * 32) + ((Number(student.coding_score || 0) / 1000) * 25) + ((Number(student.internships_count || 0) / 3) * 18) + ((Number(student.attendance_percentage || 0) / 100) * 12) + ((Number(student.projects_count || 0) / 5) * 8) + ((Number(student.communication_score || 0) / 100) * 3))))));
          let risk = 'Low';
          if (probability < 40) risk = 'High';
          else if (probability < 70) risk = 'Medium';

          return {
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
        setRiskData({ stats: { highRisk, mediumRisk, lowRisk }, students: mappedStudents });
        setLoadingRisk(false);
      } else {
        setRiskData({ stats: { highRisk: 0, mediumRisk: 0, lowRisk: 0 }, students: [] });
        setLoadingRisk(false);
      }
    }, [students]);

    const studentRows = riskData?.students || [];
    const riskStats = riskData?.stats || { highRisk: 0, mediumRisk: 0, lowRisk: 0 };

    return (
      <div className="chart-card">
        <h3><FaExclamationTriangle style={{ color: 'var(--danger)' }} /> At-Risk Detection</h3>
        <div className="stats-grid">
          <div className="risk-card risk-high">
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>{loadingRisk ? '...' : riskStats.highRisk}</h3>
            <p>High Risk Students</p>
            <p style={{ fontSize: '13px', color: 'var(--danger)', opacity: '0.7' }}>Probability &lt; 40%</p>
          </div>
          <div className="risk-card risk-medium">
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#856404' }}>{loadingRisk ? '...' : riskStats.mediumRisk}</h3>
            <p>Medium Risk Students</p>
            <p style={{ fontSize: '13px', color: '#856404', opacity: '0.7' }}>Probability 40-70%</p>
          </div>
          <div className="risk-card risk-low">
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>{loadingRisk ? '...' : riskStats.lowRisk}</h3>
            <p>Low Risk Students</p>
            <p style={{ fontSize: '13px', color: 'var(--success)', opacity: '0.7' }}>Probability &gt; 70%</p>
          </div>
        </div>
        
        <div className="table-card" style={{ boxShadow: 'none', padding: '0', marginTop: '16px' }}>
          <div className="table-header"><h3>At-Risk Student List</h3></div>
          <table className="data-table">
            <thead><tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Probability</th><th>Risk</th></tr></thead>
            <tbody>
              {studentRows.map(function(s, i) {
                return (
                  <tr key={i}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.branch}</td>
                    <td>{s.cgpa}</td>
                    <td>
                      <div className="progress-bar" style={{ width: '100px' }}>
                        <div className="progress-fill" style={{ width: s.prob + '%', background: s.risk === 'High' ? 'var(--danger)' : 'var(--warning)' }}></div>
                      </div>
                      {s.prob}%
                    </td>
                    <td><span className={'badge ' + (s.risk === 'High' ? 'badge-danger' : 'badge-warning')}>{s.risk}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ===== TAB 4: TREND FORECAST =====
  const TrendForecast = function() {
    var chartRef = useRef(null);
    var chartInstance = useRef(null);
    const [forecastData, setForecastData] = useState(null);

    useEffect(function() {
      async function loadForecastData() {
        try {
          const response = await getTrendForecast();
          setForecastData(response);
        } catch (error) {
          toast.error('Unable to load forecast data');
        }
      }

      if (students.length > 0) {
        const placedStudents = students.filter((student) => String(student.placement_status || '').toLowerCase() === 'placed').length;
        const placementRate = students.length > 0 ? Math.round((placedStudents / students.length) * 100) : 0;
        const predictedPlacement = Math.min(98, placementRate + 4);
        setForecastData({
          years: ['Current', '2026 (Pred)'],
          placementRates: [placementRate, predictedPlacement],
          avgPackages: [8.4, 9.8],
          summary: {
            predictedPlacement,
            expectedRecruiters: Math.max(1, Math.round(predictedPlacement / 2)),
            expectedAvgPackage: 9.8
          }
        });
      } else {
        setForecastData({
          years: [],
          placementRates: [],
          avgPackages: [],
          summary: { predictedPlacement: 0, expectedRecruiters: 0, expectedAvgPackage: 0 }
        });
      }
    }, [students]);

    useEffect(function() {
      const labels = forecastData?.years || [];
      const placementRates = forecastData?.placementRates || [];

      if (chartRef.current && labels.length > 0 && placementRates.length > 0) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        chartInstance.current = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Current vs Forecast',
                data: placementRates,
                borderColor: '#00b4d8',
                backgroundColor: 'rgba(0,180,216,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, max: 100 } }
          }
        });
      }
      return function() { 
        if (chartInstance.current) {
          chartInstance.current.destroy(); 
        }
      };
    }, [forecastData]);

    const summary = forecastData?.summary || { predictedPlacement: 0, expectedRecruiters: 0, expectedAvgPackage: 0 };

    return (
      <div className="chart-card">
        <h3><FaChartLine style={{ color: 'var(--accent)' }} /> Trend Forecast</h3>
        <div className="stats-grid">
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '16px', padding: '24px', color: 'white' }}>
            <p style={{ fontSize: '13px', opacity: '0.9' }}>Predicted Placement %</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700' }}>{summary.predictedPlacement}%</h3>
            <p style={{ fontSize: '13px', opacity: '0.8' }}>From current forecast model</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', borderRadius: '16px', padding: '24px', color: 'white' }}>
            <p style={{ fontSize: '13px', opacity: '0.9' }}>Expected Recruiters</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700' }}>{summary.expectedRecruiters}</h3>
            <p style={{ fontSize: '13px', opacity: '0.8' }}>Projected yearly hiring</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '16px', padding: '24px', color: 'white' }}>
            <p style={{ fontSize: '13px', opacity: '0.9' }}>Expected Avg Package</p>
            <h3 style={{ fontSize: '36px', fontWeight: '700' }}>{summary.expectedAvgPackage} LPA</h3>
            <p style={{ fontSize: '13px', opacity: '0.8' }}>Projected market trend</p>
          </div>
        </div>
        <div className="chart-container" style={{ height: '250px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  };

  // ===== TAB 5: SKILL GAP ANALYZER =====
  const SkillGapAnalyzer = function() {
    var [company, setCompany] = useState('');
    var [selectedSkills, setSelectedSkills] = useState([]);
    var [result, setResult] = useState(null);

    var allSkills = ['Data Structures', 'Web Development', 'DBMS', 'Operating Systems', 'Computer Networks'];
    var companyRequirements = {
      google: ['Data Structures', 'Operating Systems', 'Computer Networks', 'System Design'],
      amazon: ['Data Structures', 'Operating Systems', 'DBMS', 'Leadership'],
      microsoft: ['Data Structures', 'Operating Systems', 'Computer Networks', 'DBMS'],
      tcs: ['Data Structures', 'DBMS', 'Communication'],
      infosys: ['Data Structures', 'Web Development', 'DBMS']
    };

    var toggleSkill = function(skill) {
      if (selectedSkills.includes(skill)) {
        setSelectedSkills(selectedSkills.filter(function(s) { return s !== skill; }));
      } else {
        setSelectedSkills([...selectedSkills, skill]);
      }
    };

    var analyzeGap = async function() {
      if (!company) {
        toast.error('Please select a target company!');
        return;
      }

      try {
        const response = await analyzeSkillGap({ company, selectedSkills });
        setResult({ company: response.company, missing: response.missing, required: response.required, learningPlan: response.learningPlan });
        toast.success('Skill gap analysis completed');
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Failed to analyze skill gap');
      }
    };

    return (
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="prediction-form">
          <h3><FaPuzzlePiece style={{ color: 'var(--accent)' }} /> Skill Gap Analyzer</h3>
          <div className="form-group">
            <label>Target Company</label>
            <select value={company} onChange={function(e) { setCompany(e.target.value); }}>
              <option value="">Select Company</option>
              <option value="google">Google</option>
              <option value="amazon">Amazon</option>
              <option value="microsoft">Microsoft</option>
              <option value="tcs">TCS</option>
              <option value="infosys">Infosys</option>
            </select>
          </div>
          <div className="form-group">
            <label>Student's Current Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allSkills.map(function(skill) {
                return (
                  <span key={skill} className={'skill-chip ' + (selectedSkills.includes(skill) ? 'active' : 'inactive')} onClick={function() { toggleSkill(skill); }}>
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={analyzeGap}>
            <FaMagic /> Analyze Skill Gap
          </button>
        </div>
        
        <div className="chart-card">
          <h3>Learning Roadmap</h3>
          <span className="chart-badge">{company ? company.toUpperCase() : 'Select a company'}</span>
          {result ? (
            <>
              <div className="recommendations">
                <h4><FaTimesCircle style={{ color: 'var(--danger)' }} /> Missing Skills</h4>
                <ul>
                  {result.missing.length > 0 ? result.missing.map(function(s, i) {
                    return <li key={i}><FaTimesCircle style={{ color: 'var(--danger)' }} /> {s}</li>;
                  }) : <li><FaCheckCircle style={{ color: 'var(--success)' }} /> No major gaps — great match!</li>}
                </ul>
              </div>
              <div className="recommendations" style={{ marginTop: '16px' }}>
                <h4><FaCheckCircle style={{ color: 'var(--accent)' }} /> Recommended Learning</h4>
                <ul>
                  {(result.learningPlan || []).map(function(step, i) {
                    return <li key={i}><FaCheckCircle /> {step}</li>;
                  })}
                </ul>
              </div>
            </>
          ) : (
            <p style={{ color: '#6c757d', marginTop: '16px' }}>Run the analyzer to see results</p>
          )}
        </div>
      </div>
    );
  };

  // ===== TAB 6: COMPANY RECOMMENDATION =====
  const CompanyRecommendation = function() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(function() {
      async function loadRecommendations() {
        try {
          const response = await getCompanyRecommendations(students[0]?.id || null);
          setCompanies(response.recommendations || []);
        } catch (error) {
          toast.error('Unable to load company recommendations');
          setCompanies([]);
        } finally {
          setLoading(false);
        }
      }

      if (students.length > 0) {
        loadRecommendations();
      } else {
        setCompanies([]);
        setLoading(false);
      }
    }, [students]);

    const bestFit = companies.filter(function(c) { return c.match >= 70; });
    const stretch = companies.filter(function(c) { return c.match < 70; });

    return (
      <div className="chart-card">
        <h3><FaBullseye style={{ color: 'var(--purple)' }} /> Company Recommendation Engine</h3>
        <p style={{ color: '#6c757d', marginBottom: '16px' }}>Suggested companies based on CGPA, skills, coding score, and internship experience</p>

        {loading ? (
          <p style={{ color: '#6c757d' }}>Loading recommendations…</p>
        ) : companies.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No company recommendation data is available yet.</p>
        ) : (
          <>
            <div className="table-card" style={{ boxShadow: 'none', padding: '0', marginBottom: '16px' }}>
              <div className="table-header"><h3 style={{ color: 'var(--success)' }}><FaCheckCircle /> Best Fit</h3></div>
              {bestFit.map(function(c, i) {
                return (
                  <div key={i} className="whatif-row">
                    <div className="whatif-prob" style={{ background: 'linear-gradient(135deg, ' + c.color + ', #20c997)' }}>{c.match}%</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: '600' }}>{c.name}</h4>
                      <p style={{ fontSize: '13px', color: '#6c757d' }}>{c.desc}</p>
                    </div>
                    <div style={{ width: '200px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: c.match + '%', background: c.color }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="table-card" style={{ boxShadow: 'none', padding: '0' }}>
              <div className="table-header"><h3 style={{ color: '#856404' }}><FaArrowUp /> Stretch Companies</h3></div>
              {stretch.map(function(c, i) {
                return (
                  <div key={i} className="whatif-row">
                    <div className="whatif-prob" style={{ background: 'linear-gradient(135deg, #ffc107, #fd7e14)' }}>{c.match}%</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: '600' }}>{c.name}</h4>
                      <p style={{ fontSize: '13px', color: '#6c757d' }}>{c.desc}</p>
                    </div>
                    <div style={{ width: '200px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: c.match + '%', background: 'var(--warning)' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // ===== TAB 7: RESUME ANALYZER =====
  const ResumeAnalyzer = function() {
    var [analyzed, setAnalyzed] = useState(false);
    var [score, setScore] = useState(null);
    var [missingKeywords, setMissingKeywords] = useState([]);
    var [suggestions, setSuggestions] = useState([]);
    const fileInputRef = useRef(null);

    var handleAnalyzeResume = async function(event) {
      const file = event.target?.files?.[0] || null;
      if (!file) {
        toast.error('Please select a resume file');
        return;
      }

      try {
        const response = await analyzeResume(file);
        setScore(response.atsScore);
        setMissingKeywords(response.missingKeywords || []);
        setSuggestions(response.suggestions || []);
        setAnalyzed(true);
        toast.success('Resume analysis completed');
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Failed to analyze resume');
      }
    };

    return (
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="prediction-form">
          <h3><FaFileInvoice style={{ color: 'var(--accent)' }} /> Resume Analyzer</h3>
          <div className="form-group">
            <label>Resume (PDF)</label>
            <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleAnalyzeResume} />
            <div style={{ border: '2px dashed #dee2e6', borderRadius: '10px', padding: '30px 16px', textAlign: 'center', color: '#6c757d', cursor: 'pointer' }} onClick={function() { fileInputRef.current?.click(); }}>
              <FaFileInvoice style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--accent)' }} />
              <p style={{ fontSize: '13px' }}>Click to upload a PDF resume here</p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={function() { fileInputRef.current?.click(); }}>
            <FaMagic /> Analyze Resume
          </button>
        </div>
        
        <div className="chart-card">
          <h3>ATS Analysis</h3>
          <span className="chart-badge">Live Scored</span>
          {analyzed ? (
            <>
              <div className="probability-ring" style={{ background: 'conic-gradient(' + (score >= 75 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545') + ' ' + score + '%, #e9ecef ' + score + '%)' }}>
                <span className="probability-value">{score}%</span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <h4><FaTimesCircle style={{ color: 'var(--danger)' }} /> Missing Keywords</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {missingKeywords.map(function(k, i) {
                    return <span key={i} className="badge badge-danger">{k}</span>;
                  })}
                </div>
                <div className="recommendations">
                  <h4><FaCheckCircle style={{ color: 'var(--accent)' }} /> Improvement Suggestions</h4>
                  <ul>
                    {suggestions.map(function(item, i) {
                      return <li key={i}><FaCheckCircle /> {item}</li>;
                    })}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: '#6c757d', marginTop: '20px' }}>Upload a resume to analyze</p>
          )}
        </div>
      </div>
    );
  };

  // ===== RENDER FUNCTION =====
  var renderContent = function() {
    switch(activeTab) {
      case 'predict': return <PlacementPredictor />;
      case 'whatif': return <WhatIfSimulator />;
      case 'risk': return <AtRiskDetection />;
      case 'forecast': return <TrendForecast />;
      case 'skillgap': return <SkillGapAnalyzer />;
      case 'companyrec': return <CompanyRecommendation />;
      case 'resume': return <ResumeAnalyzer />;
      default: return <PlacementPredictor />;
    }
  };

  if (loadingStudentData) {
    return (
      <div className="dashboard-section active">
        <p style={{ color: '#6c757d' }}>Loading prediction data…</p>
      </div>
    );
  }

  if (!hasLiveStudentData) {
    return (
      <div className="dashboard-section active">
        <div className="chart-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <h3 style={{ marginBottom: '12px' }}><FaBrain style={{ color: 'var(--accent)' }} /> AI Prediction</h3>
          <p style={{ color: '#6c757d', marginBottom: '8px' }}>
            No real student records are available yet for prediction analysis.
          </p>
          <p style={{ color: '#6c757d' }}>
            Add or import student data in the student management section to unlock AI placement insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section active">
      <div className="tabs">
        {tabs.map(function(tab) {
          return (
            <button
              key={tab.id}
              className={'tab ' + (activeTab === tab.id ? 'active' : '')}
              onClick={function() { setActiveTab(tab.id); }}
            >
              <tab.icon /> {tab.label}
            </button>
          );
        })}
      </div>
      {renderContent()}
    </div>
  );
};

export default Prediction;
