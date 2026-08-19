import React, { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaBuilding, FaPaperPlane, FaUserCheck, FaPercentage, FaArrowUp } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Companies = () => {
  const { students } = useAppContext();
  const conversionRef = useRef(null);
  const selectedRef = useRef(null);
  const conversionInstance = useRef(null);
  const selectedInstance = useRef(null);

  // Calculate company stats
  const getCompanyData = () => {
    const companies = {};
    students.filter(s => s.placement_status === 'placed' && s.company).forEach(s => {
      if (!companies[s.company]) {
        companies[s.company] = { selected: 0, applied: Math.floor(Math.random() * 100) + 50 };
      }
      companies[s.company].selected++;
    });
    return companies;
  };

  const companyData = getCompanyData();
  const companyNames = Object.keys(companyData).sort((a, b) => companyData[b].selected - companyData[a].selected);
  const selectedData = companyNames.map(name => companyData[name].selected);
  const conversionData = companyNames.map(name => 
    Math.round((companyData[name].selected / companyData[name].applied) * 100)
  );

  const totalCompanies = companyNames.length;
  const totalSelected = students.filter(s => s.placement_status === 'placed').length;
  const totalApplied = Object.values(companyData).reduce((sum, c) => sum + c.applied, 0);
  const avgConversion = totalApplied > 0 ? Math.round((totalSelected / totalApplied) * 100) : 0;

  useEffect(() => {
    if (conversionRef.current) {
      if (conversionInstance.current) conversionInstance.current.destroy();
      conversionInstance.current = new Chart(conversionRef.current, {
        type: 'bar',
        data: {
          labels: companyNames.slice(0, 9),
          datasets: [{
            label: 'Conversion Rate %',
            data: conversionData.slice(0, 9),
            backgroundColor: '#3b82f6',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    if (selectedRef.current) {
      if (selectedInstance.current) selectedInstance.current.destroy();
      selectedInstance.current = new Chart(selectedRef.current, {
        type: 'bar',
        data: {
          labels: companyNames.slice(0, 9),
          datasets: [{
            label: 'Students Selected',
            data: selectedData.slice(0, 9),
            backgroundColor: '#10b981',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    return () => {
      if (conversionInstance.current) conversionInstance.current.destroy();
      if (selectedInstance.current) selectedInstance.current.destroy();
    };
  }, [students]);

  const stats = [
    { label: 'Companies Visited', value: totalCompanies, icon: FaBuilding, color: 'blue', change: 'Active recruiters' },
    { label: 'Total Applications', value: totalApplied.toLocaleString(), icon: FaPaperPlane, color: 'green', change: 'Across all companies' },
    { label: 'Total Selected', value: totalSelected, icon: FaUserCheck, color: 'purple', change: 'Placed students' },
    { label: 'Avg Conversion Rate', value: avgConversion + '%', icon: FaPercentage, color: 'teal', change: 'Applied to selected' },
  ];

  // Build company table data
  const companyTable = companyNames.map(name => ({
    name,
    applied: companyData[name].applied,
    selected: companyData[name].selected,
    conversion: Math.round((companyData[name].selected / companyData[name].applied) * 100),
    avgPackage: students.filter(s => s.company === name && s.package)
      .map(s => parseFloat(s.package.replace(/[^0-9.]/g, '')))
      .filter(n => !isNaN(n))
      .reduce((a, b) => a + b, 0) / (students.filter(s => s.company === name && s.package).length || 1)
  })).sort((a, b) => b.selected - a.selected);

  const getBadge = (conversion) => {
    if (conversion >= 25) return 'badge-success';
    if (conversion >= 15) return 'badge-info';
    return 'badge-warning';
  };

  return (
    <div className="dashboard-section active">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={'stat-card ' + stat.color}>
            <div className="stat-icon"><stat.icon /></div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-change up"><FaArrowUp /> {stat.change}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Company Conversion Rates</h3>
            <span className="chart-badge">Applied to Selected</span>
          </div>
          <div className="chart-container">
            <canvas ref={conversionRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Students Selected by Company</h3>
            <span className="chart-badge">Top 10</span>
          </div>
          <div className="chart-container">
            <canvas ref={selectedRef}></canvas>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Company Recruitment Funnel</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Company</th><th>Applied</th><th>Shortlisted</th><th>Selected</th><th>Conversion</th><th>Avg Package</th></tr>
          </thead>
          <tbody>
            {companyTable.length > 0 ? companyTable.map((company, index) => (
              <tr key={index}>
                <td><strong>{company.name}</strong></td>
                <td>{company.applied}</td>
                <td>{Math.round(company.applied * 0.5)}</td>
                <td>{company.selected}</td>
                <td><span className={'badge ' + getBadge(company.conversion)}>{company.conversion}%</span></td>
                <td>{company.avgPackage.toFixed(1) + ' LPA'}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>No company data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Companies;
