import React, { useState, useEffect } from 'react';
import { FaSearch, FaSchool, FaBuilding, FaMoneyBillWave, FaUserGraduate, FaChartLine } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

const Students = () => {
  const { students, loadStudents } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const role = localStorage.getItem('role');
  const collegeIdFromStorage = localStorage.getItem('collegeId');
  const collegeName = localStorage.getItem('collegeName') || 'selected college';
  const isGuest = role === 'guest';

  useEffect(() => {
    if (collegeIdFromStorage) {
      loadStudents({ college_id: collegeIdFromStorage });
    }
  }, [isGuest, collegeIdFromStorage]);

  // Get unique branches and statuses
  const branches = ['All Branches', ...new Set(students.map(s => s.branch))];
  const statuses = ['All Status', ...new Set(students.map(s => s.placement_status))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All Branches' || student.branch === selectedBranch;
    const matchesStatus = selectedStatus === 'All Status' || student.placement_status === selectedStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const placedStudents = filteredStudents.filter(s => s.placement_status === 'placed');

  const packages = placedStudents
    .map(s => parseFloat(s.package))
    .filter(p => !isNaN(p) && p > 0);

  const avgPackage = packages.length > 0
    ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1)
    : 0;

  const highestPackage = packages.length > 0
    ? Math.max(...packages).toFixed(1)
    : 0;

  const getStatusBadge = (status) => {
    if (status === 'placed') return 'badge-success';
    if (status === 'unplaced') return 'badge-warning';
    if (status === 'at_risk') return 'badge-danger';
    return 'badge-info';
  };

  const getStatusLabel = (status) => {
    const labels = {
      placed: '🎯 Placed',
      unplaced: '⏳ Unplaced',
      at_risk: '⚠️ At Risk',
      in_process: '🔄 In Process'
    };
    return labels[status] || status;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard-section active">
      {isGuest && (
        <div className="ai-insights-banner" style={{ background: 'linear-gradient(135deg, #6f42c1, #8b5cf6)' }}>
          <h2><FaSchool /> View Placement Data</h2>
          <p>Showing student placement data for {collegeName}</p>
        </div>
      )}

      {students.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon"><FaUserGraduate /></div>
            <div className="stat-value">{filteredStudents.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{placedStudents.length}</div>
            <div className="stat-label">Placed Students</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon"><FaMoneyBillWave /></div>
            <div className="stat-value">{avgPackage || 0} LPA</div>
            <div className="stat-label">Average Package</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-icon"><FaChartLine /></div>
            <div className="stat-value">{highestPackage || 0} LPA</div>
            <div className="stat-label">Highest Package</div>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder="Search by name, roll, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }}
            />
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }}
          >
            {branches.map((branch, index) => (
              <option key={index} value={branch}>{branch}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }}
          >
            {statuses.map((status, index) => (
              <option key={index} value={status}>
                {status === 'placed' ? '🎯 Placed' :
                 status === 'unplaced' ? '⏳ Unplaced' :
                 status === 'at_risk' ? '⚠️ At Risk' : '🔄 In Process'}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '13px', color: '#6c757d', alignSelf: 'center' }}>
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
      )}

      {isGuest && !collegeIdFromStorage ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6c757d' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏫</div>
          <h3>No College Selected</h3>
          <p>Return to the entry screen and select a college to view student placement data.</p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="student-grid">
          {filteredStudents.map((student, index) => (
            <div key={student.id || index} className="student-card">
              <div className="student-header">
                <div className="student-avatar">{getInitials(student.name)}</div>
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p style={{ fontSize: '12px', color: '#6c757d' }}>
                    {student.branch} - Roll: {student.roll_number}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className={'badge ' + getStatusBadge(student.placement_status)}>
                  {getStatusLabel(student.placement_status)}
                </span>
                {student.placement_status === 'placed' && student.company && (
                  <span className="badge badge-info" style={{ background: '#1e3a5f', color: 'white' }}>
                    <FaBuilding style={{ marginRight: '4px' }} /> {student.company}
                  </span>
                )}
                {student.placement_status === 'placed' && student.package && (
                  <span className="badge badge-success">
                    <FaMoneyBillWave style={{ marginRight: '4px' }} /> {student.package} LPA
                  </span>
                )}
                {student.cgpa && (
                  <span className="badge" style={{ background: '#6f42c1', color: 'white' }}>
                    📚 {student.cgpa} CGPA
                  </span>
                )}
              </div>

              <div className="student-stats">
                <div className="student-stat">
                  <div className="value">{student.cgpa || '-'}</div>
                  <div className="label">CGPA</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.placement_status === 'placed' ? student.package || '-' : '-'}</div>
                  <div className="label">Package (LPA)</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.placement_status === 'placed' ? student.company || '-' : '-'}</div>
                  <div className="label">Company</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.branch}</div>
                  <div className="label">Branch</div>
                </div>
              </div>

              {student.placement_status === 'placed' && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'rgba(40,167,69,0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(40,167,69,0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6c757d' }}>🎯 Placed at:</span>
                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>{student.company || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                    <span style={{ color: '#6c757d' }}>💰 Package:</span>
                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>{student.package || 'N/A'} LPA</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6c757d' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <h3>No Students Found</h3>
          <p>No students found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Students;
