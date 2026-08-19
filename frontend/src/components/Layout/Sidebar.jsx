import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaChartPie, FaMoneyBillWave, FaCodeBranch, FaBuilding, 
  FaHandshake, FaRoad, FaBrain, FaUsers, FaFileExport,
  FaGraduationCap, FaSignOutAlt, FaSchool, FaEye, FaServer,
  FaUserPlus
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('guest');
  const [collegeName, setCollegeName] = useState('College');

  useEffect(() => {
    const updateData = () => {
      const storedRole = localStorage.getItem('role') || 'guest';
      const storedCollege = localStorage.getItem('collegeName') || 'College';
      setRole(storedRole);
      setCollegeName(storedCollege);
    };
    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isGuest = role === 'guest';

  // Main navigation - always visible
  const mainNavItems = [
    { path: '/app/dashboard', icon: FaChartPie, label: 'Placement Overview' },
    { path: '/app/packages', icon: FaMoneyBillWave, label: 'Package Distribution' },
    { path: '/app/branches', icon: FaCodeBranch, label: 'Branch Analytics' },
    { path: '/app/companies', icon: FaBuilding, label: 'Company Analytics' },
    { path: '/app/offers', icon: FaHandshake, label: 'Multiple Offers' },
    { path: '/app/career', icon: FaRoad, label: 'Career Paths' },
  ];

  // Admin-only items
  const adminItems = [
    { path: '/app/prediction', icon: FaBrain, label: 'AI Prediction' },
    { path: '/app/students', icon: FaUsers, label: 'Student Profiles' },
    { path: '/app/student-management', icon: FaUserPlus, label: 'Student Management' },
    { path: '/app/reports', icon: FaFileExport, label: 'Reports' },
  ];

  // Guest-only items (NO College Registration here)
  const guestItems = [
    { path: '/app/students', icon: FaUsers, label: 'Student Profiles' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('collegeId');
    localStorage.removeItem('collegeName');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('app:token-changed'));
    navigate('/');
  };

  const getInitials = () => {
    if (isSuperAdmin) return 'SA';
    if (isAdmin) return 'TP';
    return 'PS';
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Admin Access';
    return 'View Only';
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="logo">
        <FaGraduationCap />
        <h2>CampusPlacement</h2>
        <span>AI ANALYTICS</span>
      </div>

      <nav className="nav-menu" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {/* Main Navigation */}
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
av-item }
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ 
          height: '1px', 
          background: 'rgba(255,255,255,0.1)', 
          margin: '8px 20px 12px 20px' 
        }} />

        {/* Admin Section - Only for logged-in admins */}
        {isAdmin && (
          <>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
av-item }
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        {/* Guest Section - Only for non-logged-in users */}
        {!isAdmin && (
          <>
            {guestItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
av-item }
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="user-profile-wrap" style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="user-profile">
          <div className="user-avatar">{getInitials()}</div>
          <div className="user-info">
            <h4>{isSuperAdmin ? 'Platform Team' : isAdmin ? 'Training Officer' : 'Parent / Student'}</h4>
            <p>{getRoleLabel()}</p>
            {collegeName && collegeName !== 'College' && (
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                <FaSchool style={{ marginRight: '4px' }} /> {collegeName}
              </p>
            )}
          </div>
        </div>
        {isGuest && (
          <div className="switch-college-link" onClick={() => navigate('/select-college')}>
            <FaSchool /> Switch college
          </div>
        )}
        <div className="switch-role-link" onClick={handleLogout}>
          <FaSignOutAlt /> Switch role / Logout
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
