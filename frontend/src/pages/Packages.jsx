import React, { useEffect, useRef } from 'react';
import { Chart, BarController, DoughnutController, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaFileContract, FaRupeeSign, FaChartLine, FaTrophy, FaArrowUp } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(BarController, DoughnutController, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const Packages = () => {
  const { students } = useAppContext();
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  // Calculate package distribution from actual data
  const calculatePackageDistribution = () => {
    const placedStudents = students.filter(s => s.placement_status === 'placed' && s.package);
    const ranges = {
      '<3 LPA': 0,
      '3-5 LPA': 0,
      '5-10 LPA': 0,
      '10-20 LPA': 0,
      '>20 LPA': 0
    };

    placedStudents.forEach(s => {
      const pkg = parseFloat(s.package.replace(/[^0-9.]/g, ''));
      if (!isNaN(pkg)) {
        if (pkg < 3) ranges['<3 LPA']++;
        else if (pkg < 5) ranges['3-5 LPA']++;
        else if (pkg < 10) ranges['5-10 LPA']++;
        else if (pkg < 20) ranges['10-20 LPA']++;
        else ranges['>20 LPA']++;
      }
    });

    return ranges;
  };

  const distribution = calculatePackageDistribution();
  const distributionLabels = Object.keys(distribution);
  const distributionData = Object.values(distribution);

  // Calculate company stats
  const getCompanyStats = () => {
    const companies = {};
    students.filter(s => s.placement_status === 'placed' && s.company).forEach(s => {
      if (!companies[s.company]) {
        companies[s.company] = { students: 0, totalPackage: 0 };
      }
      companies[s.company].students++;
      const pkg = parseFloat(s.package.replace(/[^0-9.]/g, ''));
      if (!isNaN(pkg)) companies[s.company].totalPackage += pkg;
    });
    return companies;
  };

  const companyStats = getCompanyStats();
  const companyList = Object.keys(companyStats).map(name => ({
    name,
    students: companyStats[name].students,
    avgPackage: companyStats[name].students > 0 ? 
      (companyStats[name].totalPackage / companyStats[name].students).toFixed(1) + ' LPA' : '0 LPA'
  })).sort((a, b) => b.students - a.students);

  // Calculate totals
  const totalOffers = students.filter(s => s.placement_status === 'placed').length;
  const placedStudents = students.filter(s => s.placement_status === 'placed' && s.package);
  const packages = placedStudents.map(s => parseFloat(s.package.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
  const avgPackage = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1) + ' LPA' : '0 LPA';
  const highestPackage = packages.length > 0 ? Math.max(...packages).toFixed(1) + ' LPA' : '0 LPA';
  const sortedPackages = [...packages].sort((a, b) => a - b);
  const medianPackage = sortedPackages.length > 0 ? 
    (sortedPackages.length % 2 === 0 ? 
      ((sortedPackages[sortedPackages.length/2 - 1] + sortedPackages[sortedPackages.length/2]) / 2).toFixed(1) : 
      sortedPackages[Math.floor(sortedPackages.length/2)].toFixed(1)) + ' LPA' : '0 LPA';

  useEffect(() => {
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: distributionLabels,
          datasets: [{
            label: 'Students',
            data: distributionData,
            backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#00b4d8', '#6f42c1'],
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

    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'doughnut',
        data: {
          labels: distributionLabels,
          datasets: [{
            data: distributionData,
            backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#00b4d8', '#6f42c1'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'right' } }
        }
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, [students]);

  const stats = [
    { label: 'Total Offers', value: totalOffers, icon: FaFileContract, color: 'blue', change: 'From ' + students.length + ' students' },
    { label: 'Average Package', value: avgPackage, icon: FaRupeeSign, color: 'green', change: 'Based on placed students' },
    { label: 'Median Package', value: medianPackage, icon: FaChartLine, color: 'purple', change: 'Middle of package range' },
    { label: 'Highest Package', value: highestPackage, icon: FaTrophy, color: 'teal', change: 'Top performer' },
  ];

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
            <h3>Package Range Distribution</h3>
            <span className="chart-badge">{totalOffers} Students</span>
          </div>
          <div className="chart-container">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Package Share</h3>
            <span className="chart-badge">Percentage</span>
          </div>
          <div className="chart-container">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Company-wise Package Analysis</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Company</th><th>Students</th><th>Avg Package</th><th>Tier</th></tr>
          </thead>
          <tbody>
            {companyList.length > 0 ? companyList.map((company, index) => (
              <tr key={index}>
                <td><strong>{company.name}</strong></td>
                <td>{company.students}</td>
                <td>{company.avgPackage}</td>
                <td>
                  <span className={parseFloat(company.avgPackage) > 15 ? 'badge badge-success' : 
                                    parseFloat(company.avgPackage) > 8 ? 'badge badge-info' : 
                                    'badge badge-warning'}>
                    {parseFloat(company.avgPackage) > 15 ? 'Dream' : 
                     parseFloat(company.avgPackage) > 8 ? 'Good' : 'Entry'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>No placement data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Packages;
