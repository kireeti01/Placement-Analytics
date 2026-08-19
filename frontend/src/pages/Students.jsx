import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

const Students = () => {
  const { students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Get unique branches and statuses
  const branches = ['All Branches', ...new Set(students.map(s => s.branch))];
  const statuses = ['All Status', ...new Set(students.map(s => s.placement_status === 'placed' ? 'Placed' : s.placement_status === 'unplaced' ? 'Unplaced' : 'At Risk'))];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All Branches' || student.branch === selectedBranch;
    const currentStatus = student.placement_status === 'placed' ? 'Placed' : student.placement_status === 'unplaced' ? 'Unplaced' : 'At Risk';
    const matchesStatus = selectedStatus === 'All Status' || currentStatus === selectedStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'Placed') return 'badge-success';
    if (status === 'Unplaced') return 'badge-warning';
    return 'badge-danger';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard-section active">
      <div className="admin-only-panel" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
            <option key={index} value={status}>{status}</option>
          ))}
        </select>
        <span style={{ fontSize: '13px', color: '#6c757d', alignSelf: 'center' }}>
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>

      <div className="student-grid">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <div key={index} className="student-card">
              <div className="student-header">
                <div className="student-avatar">{getInitials(student.name)}</div>
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p>{student.branch} - Roll: {student.roll_number}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className={'badge ' + getStatusBadge(student.placement_status === 'placed' ? 'Placed' : student.placement_status === 'unplaced' ? 'Unplaced' : 'At Risk')}>
                  {student.placement_status === 'placed' ? 'Placed' : student.placement_status === 'unplaced' ? 'Unplaced' : 'At Risk'}
                </span>
                {student.company && <span className="badge badge-info">{student.company}</span>}
              </div>
              <div className="student-stats">
                <div className="student-stat">
                  <div className="value">{student.cgpa || '-'}</div>
                  <div className="label">CGPA</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.package || '-'}</div>
                  <div className="label">Package</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.placement_status === 'placed' ? '✓' : '✗'}</div>
                  <div className="label">Status</div>
                </div>
                <div className="student-stat">
                  <div className="value">{student.branch}</div>
                  <div className="label">Branch</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <p>No students found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
