import React, { useEffect, useRef, useState } from 'react';
import { 
  Chart, LineController, BarController, DoughnutController, 
  LineElement, BarElement, ArcElement, PointElement, 
  CategoryScale, LinearScale, Tooltip, Legend, Filler 
} from 'chart.js';
import { 
  FaUsers, FaCheckCircle, FaUserClock, FaPercentage, 
  FaRupeeSign, FaChartLine, FaTrophy, FaExclamationTriangle, 
  FaArrowUp, FaArrowDown, FaBolt 
} from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { students, getStats, getBranchStats, loading } = useAppContext();
  const stats = getStats();
  const branchStats = getBranchStats();

  const trendChartRef = useRef(null);
  const monthlyChartRef = useRef(null);
  const branchChartRef = useRef(null);
  const careerChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const monthlyChartInstance = useRef(null);
  const branchChartInstance = useRef(null);
  const careerChartInstance = useRef(null);

  const branchLabels = Object.keys(branchStats);
  const branchRates = branchLabels.map(b => {
    const data = branchStats[b];
    return data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0;
  });

  const placedCount = students.filter(s => s.placement_status === 'placed').length;
  const unplacedCount = students.filter(s => s.placement_status === 'unplaced').length;
  const atRiskCount = students.filter(s => s.placement_status === 'at_risk').length;

  useEffect(() => {
    // Trend Chart
    if (trendChartRef.current) {
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels: ['2021', '2022', '2023', '2024', '2025'],
          datasets: [
            { 
              label: 'Placement %', 
              data: [68, 72, 75, 78, parseFloat(stats.placementRate) || 0], 
              borderColor: '#00b4d8', 
              backgroundColor: 'rgba(0,180,216,0.1)', 
              fill: true, 
              tension: 0.4, 
              pointRadius: 6, 
              pointBackgroundColor: '#00b4d8' 
            },
            { 
              label: 'Avg Package (LPA)', 
              data: [5.2, 5.8, 6.5, 7.2, parseFloat(stats.avgPackage) || 0], 
              borderColor: '#28a745', 
              backgroundColor: 'rgba(40,167,69,0.1)', 
              fill: true, 
              tension: 0.4, 
              pointRadius: 6, 
              pointBackgroundColor: '#28a745', 
              yAxisID: 'y1' 
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          scales: { 
            y: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } }, 
            y1: { position: 'right', beginAtZero: true, ticks: { callback: function(v) { return v + 'L'; } } } 
          },
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    // Monthly Chart
    if (monthlyChartRef.current) {
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
      monthlyChartInstance.current = new Chart(monthlyChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ 
            label: 'Students Placed', 
            data: [45, 120, 180, 220, 280, 320, 380, 450, 520, 680, 850, placedCount], 
            backgroundColor: '#1e3a5f', 
            borderRadius: 6 
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          scales: { y: { beginAtZero: true } }, 
          plugins: { legend: { display: false } } 
        }
      });
    }

    // Branch Chart
    if (branchChartRef.current) {
      if (branchChartInstance.current) branchChartInstance.current.destroy();
      branchChartInstance.current = new Chart(branchChartRef.current, {
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

    // Career Chart
    if (careerChartRef.current) {
      if (careerChartInstance.current) careerChartInstance.current.destroy();
      careerChartInstance.current = new Chart(careerChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Placed', 'Unplaced', 'At Risk'],
          datasets: [{ 
            data: [placedCount, unplacedCount, atRiskCount], 
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'], 
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
      if (trendChartInstance.current) trendChartInstance.current.destroy();
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
      if (branchChartInstance.current) branchChartInstance.current.destroy();
      if (careerChartInstance.current) careerChartInstance.current.destroy();
    };
  }, [students]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      <div className="spinner"></div>
    </div>;
  }

  const statCards = [
    { label: 'Total Final Year Students', value: stats.total || 0, icon: FaUsers, color: 'blue' },
    { label: 'Students Placed', value: stats.placed || 0, icon: FaCheckCircle, color: 'green' },
    { label: 'Students Unplaced', value: stats.unplaced || 0, icon: FaUserClock, color: 'orange' },
    { label: 'Placement Percentage', value: (stats.placementRate || 0) + '%', icon: FaPercentage, color: 'purple' },
    { label: 'Average Package', value: stats.avgPackage || '0 LPA', icon: FaRupeeSign, color: 'teal' },
    { label: 'Highest Package', value: stats.highestPackage || '0 LPA', icon: FaTrophy, color: 'green' },
    { label: 'At-Risk Students', value: stats.atRisk || 0, icon: FaExclamationTriangle, color: 'red' },
  ];

  return (
    <div className="dashboard-section active">
      <div className="ai-insights-banner">
        <h2><FaBolt /> AI-Powered Insights</h2>
        <p>Real-time intelligence from your placement data</p>
        <div className="insights-grid">
          <div className="insight-chip"><FaArrowUp style={{ color: '#28a745' }} /> Placement: {stats.placementRate || 0}%</div>
          <div className="insight-chip"><FaTrophy style={{ color: '#ffc107' }} /> {stats.total || 0} Total Students</div>
          <div className="insight-chip"><FaRupeeSign style={{ color: '#28a745' }} /> Avg Package: {stats.avgPackage || '0 LPA'}</div>
          <div className="insight-chip"><FaCheckCircle style={{ color: '#28a745' }} /> {stats.placed || 0} Students Placed</div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(function(stat, index) {
          return (
            <div key={index} className={'stat-card ' + stat.color}>
              <div className="stat-icon"><stat.icon /></div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>5-Year Placement Trend</h3>
            <span className="chart-badge">Historical</span>
          </div>
          <div className="chart-container">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Placement Progress</h3>
            <span className="chart-badge">2025-26</span>
          </div>
          <div className="chart-container">
            <canvas ref={monthlyChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Branch-wise Placement</h3>
            <span className="chart-badge">Comparison</span>
          </div>
          <div className="chart-container">
            <canvas ref={branchChartRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Career Path Distribution</h3>
            <span className="chart-badge">{stats.total || 0} Students</span>
          </div>
          <div className="chart-container">
            <canvas ref={careerChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
