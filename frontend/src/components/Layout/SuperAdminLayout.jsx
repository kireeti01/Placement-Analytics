import React from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { 
  FaSchool, FaUserShield, FaChartLine, FaServer, FaSignOutAlt, 
  FaGraduationCap, FaClipboardList
} from 'react-icons/fa';

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/super-admin/colleges', icon: FaSchool, label: 'Colleges' },
    { path: '/super-admin/admins', icon: FaUserShield, label: 'Admin Accounts' },
    { path: '/super-admin/requests', icon: FaClipboardList, label: 'College Requests' },
    { path: '/super-admin/stats', icon: FaChartLine, label: 'Platform Stats' },
  ];

  const pageTitles = {
    '/super-admin/colleges': 'Colleges',
    '/super-admin/admins': 'Admin Accounts',
    '/super-admin/requests': 'College Requests',
    '/super-admin/stats': 'Platform Stats',
  };

  const title = pageTitles[location.pathname] || 'Super Admin';

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('collegeId');
    localStorage.removeItem('collegeName');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('app:token-changed'));
    navigate('/');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <FaServer />
          <h2>CampusPlacement</h2>
          <span>PLATFORM CONSOLE</span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-profile-wrap">
          <div className="user-profile">
            <div className="user-avatar">SA</div>
            <div className="user-info">
              <h4>Platform Team</h4>
              <p>
                <span className="super-admin-badge" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: 'var(--purple)', 
                  background: 'rgba(111,66,193,0.08)', 
                  border: '1px solid rgba(111,66,193,0.2)', 
                  padding: '6px 12px', 
                  borderRadius: '20px' 
                }}>
                  <FaServer /> Super Admin
                </span>
              </p>
            </div>
          </div>
          <div 
            className="switch-role-link" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Switch role / Logout
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="header">
          <h1>{title}</h1>
          <div className="header-actions">
            <span className="super-admin-badge" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '11px', 
              fontWeight: '600', 
              color: 'var(--purple)', 
              background: 'rgba(111,66,193,0.08)', 
              border: '1px solid rgba(111,66,193,0.2)', 
              padding: '6px 12px', 
              borderRadius: '20px' 
            }}>
              <FaServer /> Platform-wide, aggregate-only view
            </span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
