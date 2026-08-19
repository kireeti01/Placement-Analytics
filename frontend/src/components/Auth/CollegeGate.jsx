import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSchool, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { collegeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CollegeGate = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedColleges();
  }, []);

  const loadApprovedColleges = async () => {
    setLoading(true);
    try {
      // Get all colleges from API
      const response = await collegeAPI.getAll();
      const allColleges = response.data || [];
      
      // Filter only active colleges
      const activeColleges = allColleges.filter(c => c.status === 'active');
      
      if (activeColleges.length === 0) {
        // If no colleges in API, show a message
        setColleges([]);
      } else {
        setColleges(activeColleges);
      }
      
      console.log('✅ Loaded active colleges:', activeColleges.length);
    } catch (error) {
      console.error('Failed to load colleges:', error);
      toast.error('Failed to load colleges');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectCollege = (collegeId, collegeName) => {
    localStorage.setItem('collegeId', collegeId);
    localStorage.setItem('collegeName', collegeName);
    navigate('/app/dashboard');
  };

  const goBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="role-gate">
        <div className="role-card" style={{ maxWidth: '520px' }}>
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading colleges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-gate">
      <div className="role-card" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '13px' }} onClick={goBack}>
            <FaArrowLeft /> Back
          </span>
        </div>
        <div className="logo-mark"><FaSchool /></div>
        <h2>Select Your College</h2>
        <p className="subtitle">Choose the college to view its placement data</p>
        
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
          <input
            type="text"
            className="college-search"
            placeholder="Search by college name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #dee2e6', borderRadius: '12px', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
          {filteredColleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
              <p>No colleges available.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                {colleges.length === 0 ? (
                  'No colleges have been approved yet. Contact Super Admin.'
                ) : (
                  'No colleges match your search.'
                )}
              </p>
            </div>
          ) : (
            filteredColleges.map((college) => (
              <div
                key={college.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  padding: '14px 16px', 
                  borderRadius: '14px', 
                  border: '2px solid #e9ecef', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s' 
                }}
                onClick={() => selectCollege(college.id, college.name)}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = 'var(--accent)'; 
                  e.currentTarget.style.transform = 'translateY(-2px)'; 
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = '#e9ecef'; 
                  e.currentTarget.style.transform = 'translateY(0)'; 
                  e.currentTarget.style.boxShadow = 'none'; 
                }}
              >
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  flexShrink: '0' 
                }}>
                  {college.code ? college.code.substring(0, 3).toUpperCase() : 'C'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '14px', color: 'var(--dark)', marginBottom: '2px' }}>{college.name}</h4>
                  <p style={{ fontSize: '11px', color: '#6c757d' }}>College Code: {college.code || 'N/A'}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#6c757d' }}>
          Showing {filteredColleges.length} of {colleges.length} colleges
        </div>
      </div>
    </div>
  );
};

export default CollegeGate;
