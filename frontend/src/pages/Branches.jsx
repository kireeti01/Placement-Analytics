import React, { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaLaptopCode, FaMicrochip, FaBolt, FaCogs, FaBuilding, FaArrowUp } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Branches = () => {
  const { students, getBranchStats } = useAppContext();
  const branchStats = getBranchStats();
  const branchBarRef = useRef(null);
  const branchPackageRef = useRef(null);
  const branchBarInstance = useRef(null);
  const branchPackageInstance = useRef(null);

  const branchLabels = Object.keys(branchStats);
  const branchRates = branchLabels.map(b => {
    const data = branchStats[b];
    return data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0;
  });

  // Calculate average package per branch
  const branchPackages = branchLabels.map(b => {
    const branchStudents = students.filter(s => s.branch === b && s.placement_status === 'placed' && s.package);
    const pkgs = branchStudents.map(s => parseFloat(s.package.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
    return pkgs.length > 0 ? (pkgs.reduce((a, b) => a + b, 0) / pkgs.length).toFixed(1) : 0;
  });

  // Build branch ranking data
  const branchRanking = branchLabels.map(b => ({
    name: b,
    total: branchStats[b].total,
    placed: branchStats[b].placed,
    unplaced: branchStats[b].unplaced,
    rate: branchRates[branchLabels.indexOf(b)],
    avgPackage: branchPackages[branchLabels.indexOf(b)] + ' LPA'
  })).sort((a, b) => b.rate - a.rate);

  useEffect(() => {
    if (branchBarRef.current) {
      if (branchBarInstance.current) branchBarInstance.current.destroy();
      branchBarInstance.current = new Chart(branchBarRef.current, {
        type: 'bar',
        data: {
          labels: branchLabels.length > 0 ? branchLabels : ['No Data'],
          datasets: [{
            label: 'Placement Rate %',
            data: branchRates.length > 0 ? branchRates : [0],
            backgroundColor: ['#00b4d8', '#28a745', '#ffc107', '#6f42c1', '#20c997'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    if (branchPackageRef.current) {
      if (branchPackageInstance.current) branchPackageInstance.current.destroy();
      branchPackageInstance.current = new Chart(branchPackageRef.current, {
        type: 'bar',
        data: {
          labels: branchLabels.length > 0 ? branchLabels : ['No Data'],
          datasets: [{
            label: 'Avg Package (LPA)',
            data: branchPackages.length > 0 ? branchPackages : [0],
            backgroundColor: '#1e3a5f',
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
      if (branchBarInstance.current) branchBarInstance.current.destroy();
      if (branchPackageInstance.current) branchPackageInstance.current.destroy();
    };
  }, [students]);

  const getBadge = (rate) => {
    if (rate >= 75) return 'badge-success';
    if (rate >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  const getRankColor = (rank) => {
    const colors = ['var(--success)', 'var(--accent)', 'var(--warning)', 'var(--warning)', 'var(--danger)'];
    return colors[rank - 1] || 'var(--dark)';
  };

  // Stats cards for top branches
  const topBranches = branchRanking.slice(0, 5);
  const statsColors = ['blue', 'green', 'orange', 'purple', 'teal'];
  const statsIcons = [FaLaptopCode, FaMicrochip, FaBolt, FaCogs, FaBuilding];

  return (
    <div className="dashboard-section active">
      <div className="stats-grid">
        {topBranches.map((branch, index) => (
          <div key={index} className={'stat-card ' + (statsColors[index] || 'blue')}>
            <div className="stat-icon">{React.createElement(statsIcons[index] || FaBuilding)}</div>
            <div className="stat-value">{branch.rate}%</div>
            <div className="stat-label">{branch.name} Placement Rate</div>
            <div className="stat-change up"><FaArrowUp /> {branch.rate}% from total</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Branch-wise Placement Rate</h3>
            <span className="chart-badge">Current Year</span>
          </div>
          <div className="chart-container">
            <canvas ref={branchBarRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Branch-wise Average Package</h3>
            <span className="chart-badge">LPA</span>
          </div>
          <div className="chart-container">
            <canvas ref={branchPackageRef}></canvas>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Branch Ranking</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Rank</th><th>Branch</th><th>Total</th><th>Placed</th><th>Unplaced</th><th>Rate</th><th>Avg Package</th><th>Progress</th></tr>
          </thead>
          <tbody>
            {branchRanking.length > 0 ? branchRanking.map((branch, index) => (
              <tr key={index}>
                <td><span style={{ color: getRankColor(index + 1), fontWeight: '700' }}>{index + 1}</span></td>
                <td><strong>{branch.name}</strong></td>
                <td>{branch.total}</td>
                <td>{branch.placed}</td>
                <td>{branch.unplaced}</td>
                <td><span className={'badge ' + getBadge(branch.rate)}>{branch.rate}%</span></td>
                <td>{branch.avgPackage}</td>
                <td>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: branch.rate + '%', background: branch.rate >= 75 ? 'var(--success)' : branch.rate >= 60 ? 'var(--warning)' : 'var(--danger)' }}></div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>No branch data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Branches;
