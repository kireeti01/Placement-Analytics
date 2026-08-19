import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { 
  FaChartPie, FaMoneyBillWave, FaCodeBranch, FaBuilding, 
  FaHandshake, FaRoad, FaBrain, FaUsers, FaFileExport, 
  FaGraduationCap, FaSignOutAlt, FaSchool, FaEye, FaServer,
  FaDownload, FaSyncAlt, FaUserPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { students, getStats } = useAppContext();
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

  const isAdmin = role === 'admin';
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    const adminOnlyPaths = ['/app/prediction', '/app/reports', '/app/student-management'];
    const currentPath = location.pathname;
    
    if (!isAdmin && !isSuperAdmin && adminOnlyPaths.includes(currentPath)) {
      navigate('/app/dashboard');
    }
  }, [location.pathname, isAdmin, isSuperAdmin, navigate]);

  const handleExport = () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    try {
      const stats = getStats();
      const rows = [
        ['CampusPlacement AI - Placement Report'],
        ['Generated on: ' + new Date().toLocaleString()],
        ['College: ' + collegeName],
        [''],
        ['Metric', 'Value'],
        ['Total Students', stats.total || 0],
        ['Placed Students', stats.placed || 0],
        ['Unplaced Students', stats.unplaced || 0],
        ['At Risk Students', stats.atRisk || 0],
        ['Placement Rate', `${stats.placementRate || 0}%`],
        ['Average Package', stats.avgPackage || '0 LPA'],
        ['Highest Package', stats.highestPackage || '0 LPA'],
        [''],
        ['Student Name', 'Roll Number', 'Branch', 'CGPA', 'Placement Status', 'Company', 'Package (LPA)'],
        ...students.map((student) => [
          student.name || '',
          student.roll_number || '',
          student.branch || '',
          student.cgpa || '',
          student.placement_status || '',
          student.company || '',
          student.package || ''
        ])
      ];

      const csvContent = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'Placement_Report_' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const handleRefresh = () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }
    toast.success('Refreshing data...');
    setTimeout(() => window.location.reload(), 500);
  };

  // Navigation items - NO College Registration here
  const navItems = [
    { path: '/app/dashboard', icon: FaChartPie, label: 'Placement Overview', showFor: 'all' },
    { path: '/app/packages', icon: FaMoneyBillWave, label: 'Package Distribution', showFor: 'all' },
    { path: '/app/branches', icon: FaCodeBranch, label: 'Branch Analytics', showFor: 'all' },
    { path: '/app/companies', icon: FaBuilding, label: 'Company Analytics', showFor: 'all' },
    { path: '/app/offers', icon: FaHandshake, label: 'Multiple Offers', showFor: 'all' },
    { path: '/app/career', icon: FaRoad, label: 'Career Paths', showFor: 'all' },
    { path: '/app/prediction', icon: FaBrain, label: 'AI Prediction', showFor: 'admin' },
    { path: '/app/students', icon: FaUsers, label: 'Student Profiles', showFor: 'all' },
    { path: '/app/student-management', icon: FaUserPlus, label: 'Student Management', showFor: 'admin' },
    { path: '/app/reports', icon: FaFileExport, label: 'Reports', showFor: 'admin' },
  ];

  const pageTitles = {
    '/app/dashboard': 'Placement Overview',
    '/app/packages': 'Package Distribution',
    '/app/branches': 'Branch Analytics',
    '/app/companies': 'Company Analytics',
    '/app/offers': 'Multiple Offer Analysis',
    '/app/career': 'Career Path Analysis',
    '/app/prediction': 'AI Placement Prediction',
    '/app/students': 'Student Profiles',
    '/app/student-management': 'Student Management',
    '/app/reports': 'Reports & Documentation',
  };

  const title = pageTitles[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('collegeId');
    localStorage.removeItem('collegeName');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('app:token-changed'));
    navigate('/');
  };

  if (isSuperAdmin) {
    navigate('/super-admin/colleges');
    return null;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <FaGraduationCap />
          <h2>CampusPlacement</h2>
          <span>AI ANALYTICS</span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            if (item.showFor === 'admin' && !isAdmin) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="user-profile-wrap">
          <div className="user-profile">
            <div className="user-avatar">{isAdmin ? 'TP' : 'PS'}</div>
            <div className="user-info">
              <h4>{isAdmin ? 'Training Officer' : 'Parent / Student'}</h4>
              <p>{isAdmin ? 'Admin Access' : 'View Only'}</p>
              {collegeName && collegeName !== 'College' && (
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                  <FaSchool style={{ marginRight: '4px' }} /> {collegeName}
                </p>
              )}
            </div>
          </div>
          <div className="switch-role-link" onClick={handleLogout}>
            <FaSignOutAlt /> Switch role / Logout
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="header">
          <h1>{title}</h1>
          <div className="header-actions">
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1e3a5f', 
              background: 'rgba(30,58,95,0.08)', 
              border: '1px solid rgba(30,58,95,0.15)', 
              padding: '8px 16px', 
              borderRadius: '20px' 
            }}>
              <FaSchool style={{ fontSize: '14px' }} /> 
              <span>{collegeName}</span>
            </span>

            {!isAdmin && (
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#dc3545', 
                background: 'rgba(220,53,69,0.08)', 
                border: '1px solid rgba(220,53,69,0.2)', 
                padding: '6px 12px', 
                borderRadius: '20px' 
              }}>
                <FaEye /> View Only
              </span>
            )}
            {isAdmin && (
              <>
                <button 
                  className="btn btn-outline" 
                  onClick={handleExport}
                  style={{ cursor: 'pointer' }}
                >
                  <FaDownload /> Export CSV
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleRefresh}
                  style={{ cursor: 'pointer' }}
                >
                  <FaSyncAlt /> Refresh
                </button>
              </>
            )}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
