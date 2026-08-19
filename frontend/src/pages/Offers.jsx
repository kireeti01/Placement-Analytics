import React, { useEffect, useRef } from 'react';
import { Chart, DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaFileContract, FaCopy, FaLayerGroup, FaCrown } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

Chart.register(DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Offers = () => {
  const { students, placements } = useAppContext();
  const doughnutRef = useRef(null);
  const packageRef = useRef(null);
  const doughnutInstance = useRef(null);
  const packageInstance = useRef(null);

  const getOfferCount = (studentId) => {
    return placements.filter(p => p.student_id === studentId).length;
  };

  const getOfferDistribution = () => {
    const distribution = { '1 Offer': 0, '2 Offers': 0, '3 Offers': 0, '4+ Offers': 0 };
    const placedStudents = students.filter(s => s.placement_status === 'placed');

    placedStudents.forEach(s => {
      const offers = Math.min(Math.max(getOfferCount(s.id), 1), 4);
      if (offers >= 4) distribution['4+ Offers']++;
      else if (offers === 3) distribution['3 Offers']++;
      else if (offers === 2) distribution['2 Offers']++;
      else distribution['1 Offer']++;
    });

    return distribution;
  };

  const distribution = getOfferDistribution();
  const distributionLabels = Object.keys(distribution);
  const distributionData = Object.values(distribution);

  // Calculate package vs offers
  const getPackageByOffers = () => {
    const placedStudents = students.filter(s => s.placement_status === 'placed' && s.package);
    const result = { '1 Offer': { avg: 0, max: 0, count: 0 }, '2 Offers': { avg: 0, max: 0, count: 0 }, '3 Offers': { avg: 0, max: 0, count: 0 }, '4+ Offers': { avg: 0, max: 0, count: 0 } };

    placedStudents.forEach(s => {
      const offers = Math.min(Math.max(getOfferCount(s.id), 1), 4);
      const pkg = parseFloat(s.package.replace(/[^0-9.]/g, '')) || 0;
      const key = offers >= 4 ? '4+ Offers' : offers === 3 ? '3 Offers' : offers === 2 ? '2 Offers' : '1 Offer';
      result[key].avg += pkg;
      result[key].max = Math.max(result[key].max, pkg);
      result[key].count++;
    });

    Object.keys(result).forEach(key => {
      if (result[key].count > 0) {
        result[key].avg = result[key].avg / result[key].count;
      }
    });

    return result;
  };

  const packageByOffers = getPackageByOffers();
  const offerLabels = ['1 Offer', '2 Offers', '3 Offers', '4+ Offers'];
  const avgPackages = offerLabels.map(l => packageByOffers[l]?.avg?.toFixed(1) || 0);
  const maxPackages = offerLabels.map(l => packageByOffers[l]?.max || 0);

  const totalPlaced = students.filter(s => s.placement_status === 'placed').length;
  const oneOffer = distribution['1 Offer'] || 0;
  const twoOffers = distribution['2 Offers'] || 0;
  const threeOffers = distribution['3 Offers'] || 0;
  const fourPlusOffers = distribution['4+ Offers'] || 0;

  useEffect(() => {
    if (doughnutRef.current) {
      if (doughnutInstance.current) doughnutInstance.current.destroy();
      doughnutInstance.current = new Chart(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: distributionLabels,
          datasets: [{
            data: distributionData,
            backgroundColor: ['#00b4d8', '#28a745', '#6f42c1', '#ffc107'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    if (packageRef.current) {
      if (packageInstance.current) packageInstance.current.destroy();
      packageInstance.current = new Chart(packageRef.current, {
        type: 'bar',
        data: {
          labels: offerLabels,
          datasets: [
            {
              label: 'Avg Package (LPA)',
              data: avgPackages,
              backgroundColor: '#00b4d8',
              borderRadius: 8
            },
            {
              label: 'Max Package (LPA)',
              data: maxPackages,
              backgroundColor: '#28a745',
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    return () => {
      if (doughnutInstance.current) doughnutInstance.current.destroy();
      if (packageInstance.current) packageInstance.current.destroy();
    };
  }, [students]);

  const stats = [
    { label: 'Students with 1 Offer', value: oneOffer, icon: FaFileContract, color: 'blue', change: (totalPlaced > 0 ? Math.round((oneOffer/totalPlaced)*100) : 0) + '% of placed' },
    { label: 'Students with 2 Offers', value: twoOffers, icon: FaCopy, color: 'green', change: (totalPlaced > 0 ? Math.round((twoOffers/totalPlaced)*100) : 0) + '% of placed' },
    { label: 'Students with 3 Offers', value: threeOffers, icon: FaLayerGroup, color: 'purple', change: (totalPlaced > 0 ? Math.round((threeOffers/totalPlaced)*100) : 0) + '% of placed' },
    { label: 'Students with 4+ Offers', value: fourPlusOffers, icon: FaCrown, color: 'teal', change: (totalPlaced > 0 ? Math.round((fourPlusOffers/totalPlaced)*100) : 0) + '% of placed' },
  ];

  // Top performers (students with highest CGPA)
  const topPerformers = students
    .filter(s => s.placement_status === 'placed')
    .sort((a, b) => parseFloat(b.cgpa || 0) - parseFloat(a.cgpa || 0))
    .slice(0, 5)
    .map(s => ({
      name: s.name,
      branch: s.branch,
      cgpa: s.cgpa,
      offers: Math.min(Math.max(getOfferCount(s.id), 1), 4),
      companies: s.company || 'Multiple',
      highest: s.package || 'N/A'
    }));

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
            <h3>Offer Distribution</h3>
            <span className="chart-badge">{totalPlaced} Placed</span>
          </div>
          <div className="chart-container">
            <canvas ref={doughnutRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Package vs Number of Offers</h3>
            <span className="chart-badge">Correlation</span>
          </div>
          <div className="chart-container">
            <canvas ref={packageRef}></canvas>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Top Performers (Multiple Offers)</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Offers</th><th>Companies</th><th>Highest Package</th></tr>
          </thead>
          <tbody>
            {topPerformers.length > 0 ? topPerformers.map((student, index) => (
              <tr key={index}>
                <td><strong>{student.name}</strong></td>
                <td>{student.branch}</td>
                <td>{student.cgpa}</td>
                <td><span className="badge badge-success">{student.offers}</span></td>
                <td>{student.companies}</td>
                <td style={{ color: 'var(--success)', fontWeight: '700' }}>{student.highest}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>No placement data available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Offers;
