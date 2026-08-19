import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaDownload, FaSyncAlt, FaEye, FaSchool } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Header = () => {
  const location = useLocation();
  const [collegeName, setCollegeName] = useState('College');
  const [role, setRole] = useState('guest');

  // Read from localStorage on mount and when it changes
  useEffect(() => {
    const updateData = () => {
      const storedRole = localStorage.getItem('role') || 'guest';
      const storedCollege = localStorage.getItem('collegeName') || 'College';
      setRole(storedRole);
      setCollegeName(storedCollege);
      console.log('Header updated - Role:', storedRole, 'College:', storedCollege);
    };

    updateData();

    // Listen for storage changes (in case another tab changes it)
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

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
    '/app/college-registration': 'College Registration',
    '/app/reports': 'Reports & Documentation',
  };

  const title = pageTitles[location.pathname] || 'Dashboard';
  const isAdmin = role === 'admin' || role === 'super_admin';

  const handleExport = () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    try {
      const rows = [
        ['CampusPlacement AI - Placement Report'],
        ['Generated on: ' + new Date().toLocaleString()],
        ['College: ' + collegeName],
        [''],
        ['Metric', 'Value', 'Change from Last Year'],
        ['Total Final Year Students', '1,250', '+8%'],
        ['Students Placed', '1,025', '+12%'],
        ['Students Unplaced', '225', '-15%'],
        ['Placement Percentage', '82.0%', '+3.2%'],
        ['Average Package', '8.4 LPA', '+1.2 LPA'],
        ['Median Package', '7.5 LPA', '+0.8 LPA'],
        ['Highest Package', '45 LPA', '+5 LPA'],
        ['At-Risk Students', '89', '-12'],
        [''],
        ['=== 5-Year Placement Trend ==='],
        ['Year', 'Placement %', 'Avg Package (LPA)'],
        ['2021', '68%', '5.2'],
        ['2022', '72%', '5.8'],
        ['2023', '75%', '6.5'],
        ['2024', '78%', '7.2'],
        ['2025', '82%', '8.4'],
        [''],
        ['=== Branch-wise Analysis ==='],
        ['Branch', 'Total Students', 'Placed', 'Placement Rate', 'Avg Package'],
        ['CSE', '450', '414', '92%', '10.2 LPA'],
        ['ECE', '300', '234', '78%', '7.8 LPA'],
        ['EEE', '200', '130', '65%', '6.5 LPA'],
        ['Mechanical', '180', '104', '58%', '5.8 LPA'],
        ['Civil', '120', '62', '52%', '5.2 LPA'],
        [''],
        ['=== Career Path Distribution ==='],
        ['Career Path', 'Count', 'Percentage'],
        ['Placed', '1,025', '82%'],
        ['Higher Studies', '125', '10%'],
        ['Entrepreneurship', '45', '3.6%'],
        ['Govt Exam Prep', '35', '2.8%'],
        ['Other', '20', '1.6%']
      ];

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'Placement_Report_' + new Date().toISOString().slice(0,10) + '.csv';
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
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="header-actions">
        {/* College Name Badge - Always visible */}
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
  );
};

export default Header;
