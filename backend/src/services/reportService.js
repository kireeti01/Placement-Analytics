const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const generatePlacementReport = async (data, format = 'excel') => {
  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Placement Report');

    // Headers
    worksheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'roll', width: 15 },
      { header: 'Branch', key: 'branch', width: 15 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Package (LPA)', key: 'package', width: 15 },
      { header: 'Offer Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Add data
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e3a5f' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    return workbook;
  }

  return null;
};

module.exports = { generatePlacementReport };
