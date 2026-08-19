import React from 'react';

const StudentCard = ({ student }) => {
  const getStatusBadge = (status) => {
    if (status === 'Placed') return 'badge-success';
    if (status === 'Unplaced') return 'badge-warning';
    return 'badge-danger';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayStatus = student.placement_status
    ? (student.placement_status === 'placed' ? 'Placed' : student.placement_status === 'unplaced' ? 'Unplaced' : 'At Risk')
    : (student.status ? (student.status.charAt(0).toUpperCase() + student.status.slice(1)) : 'Unknown');

  return (
    <div className="student-card">
      <div className="student-header">
        <div className="student-avatar">{getInitials(student.name)}</div>
        <div className="student-info">
          <h4>{student.name}</h4>
          <p>{student.branch} - Roll: {student.roll_number || student.roll || '-'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <span className={'badge ' + getStatusBadge(displayStatus)}>{displayStatus}</span>
        {student.offers > 0 && <span className="badge badge-info">{student.offers} Offers</span>}
      </div>
      <div className="student-stats">
        <div className="student-stat">
          <div className="value">{student.cgpa}</div>
          <div className="label">CGPA</div>
        </div>
        <div className="student-stat">
          <div className="value">{student.package}</div>
          <div className="label">Package</div>
        </div>
        <div className="student-stat">
          <div className="value">{student.internships}</div>
          <div className="label">Internships</div>
        </div>
        <div className="student-stat">
          <div className="value">{student.coding}</div>
          <div className="label">Coding</div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
