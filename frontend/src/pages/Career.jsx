import React, { useEffect, useRef } from 'react';
import { Chart, PieController, LineController, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { FaBriefcase, FaBook, FaRocket, FaUniversity, FaQuestionCircle } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(PieController, LineController, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const Career = () => {
  const { students, placements, getCareerStats } = useAppContext();
  const pieRef = useRef(null);
  const trendRef = useRef(null);
  const pieInstance = useRef(null);
  const trendInstance = useRef(null);

  const careerStats = getCareerStats();
  const placedCount = students.filter(s => s.placement_status === 'placed').length;
  const unplacedCount = students.filter(s => s.placement_status === 'unplaced').length;
  const atRiskCount = students.filter(s => s.placement_status === 'at_risk').length;
  const totalStudents = students.length;

  const getPackageValue = (student) => {
    const packageValue = parseFloat(student?.package?.replace(/[^0-9.]/g, ''));
    return isNaN(packageValue) ? 0 : packageValue;
  };

  const packageValues = placements.length > 0
    ? placements
        .map(p => parseFloat(p.package_amount || 0))
        .filter(value => !isNaN(value))
    : students
        .filter(s => s.placement_status === 'placed')
        .map(getPackageValue)
        .filter(value => value > 0);

  const avgPlacedPackage = packageValues.length > 0
    ? (packageValues.reduce((sum, value) => sum + value, 0) / packageValues.length).toFixed(2) + ' LPA'
    : '0 LPA';

  // Simulate career path distribution
  const higherStudies = Math.floor(placedCount * 0.12);
  const entrepreneurship = Math.floor(placedCount * 0.04);
  const govtExams = Math.floor(placedCount * 0.03);
  const other = Math.floor(placedCount * 0.02);
  const actualPlaced = placedCount - higherStudies - entrepreneurship - govtExams - other;

  const careerData = {
    labels: ['Placed', 'Higher Studies', 'Entrepreneurship', 'Govt Exams', 'Other'],
    data: [actualPlaced, higherStudies, entrepreneurship, govtExams, other]
  };

  // Trend data (simulated)
  const trendData = {
    labels: ['2021', '2022', '2023', '2024', '2025'],
    placed: [850, 900, 950, 990, actualPlaced],
    higherStudies: [80, 90, 100, 110, higherStudies],
    entrepreneurship: [20, 25, 30, 38, entrepreneurship]
  };

  useEffect(() => {
    if (pieRef.current) {
      if (pieInstance.current) pieInstance.current.destroy();
      pieInstance.current = new Chart(pieRef.current, {
        type: 'pie',
        data: {
          labels: careerData.labels,
          datasets: [{
            data: careerData.data,
            backgroundColor: ['#00b4d8', '#28a745', '#6f42c1', '#ffc107', '#20c997'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } }
        }
      });
    }

    if (trendRef.current) {
      if (trendInstance.current) trendInstance.current.destroy();
      trendInstance.current = new Chart(trendRef.current, {
        type: 'line',
        data: {
          labels: trendData.labels,
          datasets: [
            {
              label: 'Placed',
              data: trendData.placed,
              borderColor: '#00b4d8',
              backgroundColor: 'rgba(0,180,216,0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Higher Studies',
              data: trendData.higherStudies,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40,167,69,0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Entrepreneurship',
              data: trendData.entrepreneurship,
              borderColor: '#6f42c1',
              backgroundColor: 'rgba(111,66,193,0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    return () => {
      if (pieInstance.current) pieInstance.current.destroy();
      if (trendInstance.current) trendInstance.current.destroy();
    };
  }, [students]);

  const stats = [
    { label: 'Placed', value: placedCount, icon: FaBriefcase, color: 'blue', change: (totalStudents > 0 ? Math.round((placedCount/totalStudents)*100) : 0) + '%' },
    { label: 'Higher Studies', value: higherStudies, icon: FaBook, color: 'green', change: (totalStudents > 0 ? Math.round((higherStudies/totalStudents)*100) : 0) + '%' },
    { label: 'Entrepreneurship', value: entrepreneurship, icon: FaRocket, color: 'purple', change: (totalStudents > 0 ? Math.round((entrepreneurship/totalStudents)*100) : 0) + '%' },
    { label: 'Govt Exam Prep', value: govtExams, icon: FaUniversity, color: 'orange', change: (totalStudents > 0 ? Math.round((govtExams/totalStudents)*100) : 0) + '%' },
    { label: 'Other', value: other, icon: FaQuestionCircle, color: 'teal', change: (totalStudents > 0 ? Math.round((other/totalStudents)*100) : 0) + '%' },
  ];

  const careerPaths = [
    { path: 'Placed', count: actualPlaced, percentage: (totalStudents > 0 ? Math.round((actualPlaced/totalStudents)*100) : 0), destinations: 'IT, Core, Consulting, Finance', avg: avgPlacedPackage },
    { path: 'Higher Studies', count: higherStudies, percentage: (totalStudents > 0 ? Math.round((higherStudies/totalStudents)*100) : 0), destinations: 'IITs, IISc, US/UK Universities', avg: '-' },
    { path: 'Entrepreneurship', count: entrepreneurship, percentage: (totalStudents > 0 ? Math.round((entrepreneurship/totalStudents)*100) : 0), destinations: 'Startups, Tech Ventures', avg: '-' },
    { path: 'Govt Exam Prep', count: govtExams, percentage: (totalStudents > 0 ? Math.round((govtExams/totalStudents)*100) : 0), destinations: 'UPSC, GATE, Banking, SSC', avg: '-' },
    { path: 'Other', count: other, percentage: (totalStudents > 0 ? Math.round((other/totalStudents)*100) : 0), destinations: 'Family Business, Gap Year', avg: '-' },
  ];

  return (
    <div className="dashboard-section active">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={'stat-card ' + stat.color}>
            <div className="stat-icon"><stat.icon /></div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Career Path Distribution</h3>
            <span className="chart-badge">{totalStudents} Students</span>
          </div>
          <div className="chart-container">
            <canvas ref={pieRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Career Path Trends (5 Years)</h3>
            <span className="chart-badge">Historical</span>
          </div>
          <div className="chart-container">
            <canvas ref={trendRef}></canvas>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Career Path Details</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Path</th><th>Count</th><th>Percentage</th><th>Top Destinations</th><th>Avg Package</th></tr>
          </thead>
          <tbody>
            {careerPaths.map((item, index) => (
              <tr key={index}>
                <td><strong>{item.path}</strong></td>
                <td>{item.count}</td>
                <td>{item.percentage}%</td>
                <td>{item.destinations}</td>
                <td>{item.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Career;
