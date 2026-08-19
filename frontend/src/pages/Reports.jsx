import React from 'react';
import { FaFileExport, FaChartPie, FaCodeBranch, FaBuilding, FaUserGraduate, FaAward, FaCertificate } from 'react-icons/fa';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useAppContext } from '../context/AppContext';

// Import autoTable differently
const autoTable = (doc, options) => {
  // Simple table rendering without jspdf-autotable
  const { head, body, startY, theme, headStyles, bodyStyles } = options;
  let y = startY || 20;
  const margin = 14;
  const pageWidth = doc.internal.pageSize.width;
  const colWidth = (pageWidth - margin * 2) / head[0].length;

  // Draw header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  head.forEach((row, rowIndex) => {
    let x = margin;
    row.forEach((cell, colIndex) => {
      doc.rect(x, y, colWidth, 10, 'S');
      doc.text(cell, x + 2, y + 7);
      x += colWidth;
    });
    y += 10;
  });

  // Draw body
  doc.setFont('helvetica', 'normal');
  body.forEach((row, rowIndex) => {
    let x = margin;
    row.forEach((cell, colIndex) => {
      doc.rect(x, y, colWidth, 10, 'S');
      doc.text(String(cell), x + 2, y + 7);
      x += colWidth;
    });
    y += 10;
  });

  return doc;
};

const Reports = () => {
  const { students, placements } = useAppContext();

  const getPackageValue = (student) => {
    const directValue = parseFloat(student?.package?.replace(/[^0-9.]/g, ''));
    if (!isNaN(directValue)) return directValue;
    return 0;
  };

  const getOfferCount = (studentId) => {
    return placements.filter(p => p.student_id === studentId || p.Student?.id === studentId).length;
  };

  const getPlacementPackageValues = () => {
    if (placements.length > 0) {
      return placements
        .map(p => parseFloat(p.package_amount || 0))
        .filter(value => !isNaN(value));
    }

    return students
      .filter(s => s.placement_status === 'placed')
      .map(getPackageValue)
      .filter(value => value > 0);
  };

  const reportPlacementData = () => {
    const totalStudents = students.length;
    const placedStudents = students.filter(s => s.placement_status === 'placed').length;
    const unplacedStudents = students.filter(s => s.placement_status === 'unplaced').length;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) + '%' : '0%';

    const packageValues = getPlacementPackageValues();
    const avgPackage = packageValues.length > 0
      ? (packageValues.reduce((sum, value) => sum + value, 0) / packageValues.length).toFixed(2) + ' LPA'
      : '0 LPA';

    return [
      ['Total Students', 'Placed', 'Unplaced', 'Placement %', 'Avg Package'],
      [totalStudents, placedStudents, unplacedStudents, placementRate, avgPackage]
    ];
  };

  const reportBranchData = () => {
    const branchMap = {};
    students.forEach((student) => {
      const branch = student.branch || 'Unknown';
      if (!branchMap[branch]) {
        branchMap[branch] = { total: 0, placed: 0, unplaced: 0, packages: [] };
      }
      branchMap[branch].total += 1;
      if (student.placement_status === 'placed') branchMap[branch].placed += 1;
      if (student.placement_status === 'unplaced') branchMap[branch].unplaced += 1;

      const packageValue = parseFloat(student.package?.replace(/[^0-9.]/g, ''));
      if (!isNaN(packageValue)) branchMap[branch].packages.push(packageValue);
    });

    return [
      ['Branch', 'Total', 'Placed', 'Unplaced', 'Placement %', 'Avg Package'],
      ...Object.entries(branchMap).map(([branch, stats]) => {
        const placementRate = stats.total > 0 ? ((stats.placed / stats.total) * 100).toFixed(1) + '%' : '0%';
        const avgPackage = stats.packages.length > 0
          ? (stats.packages.reduce((sum, value) => sum + value, 0) / stats.packages.length).toFixed(2) + ' LPA'
          : '0 LPA';
        return [branch, stats.total, stats.placed, stats.unplaced, placementRate, avgPackage];
      })
    ];
  };

  const reportCompanyData = () => {
    const companyMap = {};

    if (placements.length > 0) {
      placements.forEach((placement) => {
        const company = placement.Company?.name || placement.company || 'Unknown';
        if (!companyMap[company]) {
          companyMap[company] = { count: 0, totalPackage: 0 };
        }
        companyMap[company].count += 1;
        companyMap[company].totalPackage += parseFloat(placement.package_amount || 0);
      });
    } else {
      students
        .filter(student => student.placement_status === 'placed' && student.company)
        .forEach((student) => {
          const company = student.company;
          if (!companyMap[company]) {
            companyMap[company] = { count: 0, totalPackage: 0 };
          }
          companyMap[company].count += 1;
          companyMap[company].totalPackage += getPackageValue(student);
        });
    }

    return [
      ['Company', 'Total Offers', 'Avg Package'],
      ...Object.entries(companyMap).map(([company, stats]) => [
        company,
        stats.count,
        stats.count > 0 ? (stats.totalPackage / stats.count).toFixed(2) + ' LPA' : '0 LPA'
      ])
    ];
  };

  const reportStudentData = () => {
    return [
      ['Name', 'Branch', 'Roll', 'CGPA', 'Status', 'Offers', 'Company', 'Package'],
      ...students.map((student) => [
        student.name,
        student.branch || 'Unknown',
        student.roll_number || student.roll || '-',
        student.cgpa || '-',
        student.placement_status || '-',
        getOfferCount(student.id),
        student.company || '-',
        student.package || '-'
      ])
    ];
  };

  const reportNbaData = () => {
    const packageValues = getPlacementPackageValues();
    const avgPackage = packageValues.length > 0
      ? (packageValues.reduce((sum, value) => sum + value, 0) / packageValues.length).toFixed(2) + ' LPA'
      : '0 LPA';

    return [
      ['Metric', 'Value'],
      ['Total Students', students.length],
      ['Placed Students', students.filter(s => s.placement_status === 'placed').length],
      ['Unplaced Students', students.filter(s => s.placement_status === 'unplaced').length],
      ['Placement %', students.length > 0 ? ((students.filter(s => s.placement_status === 'placed').length / students.length) * 100).toFixed(1) + '%' : '0%'],
      ['Avg Package', avgPackage]
    ];
  };

  const reportNaacData = () => {
    const packageValues = getPlacementPackageValues();
    const avgPackage = packageValues.length > 0
      ? (packageValues.reduce((sum, value) => sum + value, 0) / packageValues.length).toFixed(2) + ' LPA'
      : '0 LPA';

    const companyNames = placements.length > 0
      ? new Set(placements.map(p => p.Company?.name || p.company || '')).size
      : new Set(students.filter(s => s.placement_status === 'placed' && s.company).map(s => s.company)).size;

    return [
      ['Metric', 'Value'],
      ['Placement %', students.length > 0 ? ((students.filter(s => s.placement_status === 'placed').length / students.length) * 100).toFixed(1) + '%' : '0%'],
      ['Avg Package', avgPackage],
      ['Companies Visited', companyNames],
      ['Total Offers', placements.length || students.filter(s => s.placement_status === 'placed').length]
    ];
  };

  const getReportData = (reportType) => {
    switch (reportType) {
      case 'Placement Report':
        return reportPlacementData();
      case 'Branch Report':
        return reportBranchData();
      case 'Company Report':
        return reportCompanyData();
      case 'Student Report':
        return reportStudentData();
      case 'NBA Report':
        return reportNbaData();
      case 'NAAC Report':
        return reportNaacData();
      default:
        return [[], []];
    }
  };

  const downloadPDF = (title, headers, data) => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 95);
      doc.text(title, margin, 20);
      
      // Add subtitle
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      const dateStr = new Date().toLocaleDateString();
      doc.text('Generated on: ' + dateStr, margin, 28);
      
      let y = 35;
      const colCount = headers.length;
      const colWidth = (pageWidth - margin * 2) / colCount;
      
      // Draw header row
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        const x = margin + (i * colWidth);
        doc.setFillColor(30, 58, 95);
        doc.rect(x, y, colWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(header, x + 2, y + 7);
      });
      y += 10;
      
      // Draw data rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      data.forEach((row, rowIndex) => {
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
        row.forEach((cell, i) => {
          const x = margin + (i * colWidth);
          if (rowIndex % 2 === 0) {
            doc.setFillColor(248, 249, 250);
            doc.rect(x, y, colWidth, 10, 'F');
          }
          doc.rect(x, y, colWidth, 10, 'S');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(String(cell), x + 2, y + 7);
        });
        y += 10;
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('CampusPlacement AI - Confidential Report', margin, doc.internal.pageSize.height - 10);
        doc.text('Page ' + i + ' of ' + pageCount, pageWidth - 30, doc.internal.pageSize.height - 10);
      }
      
      doc.save(title + '.pdf');
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    }
  };

  const downloadExcel = (title, headers, data) => {
    try {
      const wsData = [headers, ...data];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const colWidths = headers.map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, title + '.xlsx');
      return true;
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel. Please try again.');
      return false;
    }
  };

  const handleDownload = (reportType, format) => {
    const reportData = getReportData(reportType);
    const headers = reportData[0] || [];
    const data = reportData.slice(1);
    let title = reportType.replace(/\s+/g, '_');

    if (format === 'PDF') {
      downloadPDF(title, headers, data);
    } else if (format === 'Excel') {
      downloadExcel(title, headers, data);
    }
  };

  const reports = [
    { 
      title: 'Placement Report', 
      icon: FaChartPie, 
      color: 'var(--accent)', 
      desc: 'Overall placement statistics, KPIs and trend summary',
      type: 'Placement Report'
    },
    { 
      title: 'Branch Report', 
      icon: FaCodeBranch, 
      color: 'var(--success)', 
      desc: 'Department-wise placement rate and package breakdown',
      type: 'Branch Report'
    },
    { 
      title: 'Company Report', 
      icon: FaBuilding, 
      color: 'var(--purple)', 
      desc: 'Recruiter-wise applications, shortlists and offers',
      type: 'Company Report'
    },
    { 
      title: 'Student Report', 
      icon: FaUserGraduate, 
      color: 'var(--teal)', 
      desc: 'Full roster with CGPA, offers and placement status',
      type: 'Student Report'
    },
    { 
      title: 'NBA Report', 
      icon: FaAward, 
      color: 'var(--warning)', 
      desc: 'Outcome-based accreditation placement documentation',
      type: 'NBA Report'
    },
    { 
      title: 'NAAC Report', 
      icon: FaCertificate, 
      color: 'var(--danger)', 
      desc: 'Institutional accreditation placement evidence pack',
      type: 'NAAC Report'
    },
  ];

  return (
    <div className="dashboard-section active">
      <div className="ai-insights-banner">
        <h2><FaFileExport /> Reporting Module</h2>
        <p>Generate and export placement documentation for TPO, NBA & NAAC audits</p>
      </div>

      <div className="student-grid">
        {reports.map((report, index) => (
          <div key={index} className="table-card">
            <div className="table-header">
              <h3><report.icon style={{ color: report.color, marginRight: '8px' }} /> {report.title}</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '16px' }}>{report.desc}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: '1', justifyContent: 'center' }} 
                onClick={() => handleDownload(report.type, 'PDF')}
              >
                <i className="fas fa-file-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: '1', justifyContent: 'center' }} 
                onClick={() => handleDownload(report.type, 'Excel')}
              >
                <i className="fas fa-file-excel"></i> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
