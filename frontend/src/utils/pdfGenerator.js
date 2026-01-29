// frontend/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from Permission Letter data
 */
export const generatePLPDF = async (plData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header
  pdf.setFillColor(52, 73, 94);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERMISSION LETTER', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Hostel Management System', pageWidth / 2, 30, { align: 'center' });
  
  // Student Details Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Student Information', 20, 55);
  
  pdf.setDrawColor(52, 73, 94);
  pdf.setLineWidth(0.5);
  pdf.line(20, 57, pageWidth - 20, 57);
  
  // Details
  let yPos = 70;
  const lineHeight = 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const details = [
    { label: 'Name:', value: plData.name },
    { label: 'Registration No:', value: plData.regNo },
    { label: 'Department:', value: plData.department },
    { label: 'Year of Study:', value: plData.yearOfStudy },
    { label: 'Hostel:', value: plData.hostelName },
    { label: 'Room No:', value: plData.roomNo }
  ];
  
  details.forEach(({ label, value }) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(value), 70, yPos);
    yPos += lineHeight;
  });
  
  // Visit Details Section
  yPos += 5;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Visit Details', 20, yPos);
  pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);
  
  yPos += 15;
  pdf.setFontSize(11);
  
  const visitDetails = [
    { label: 'Place of Visit:', value: plData.placeOfVisit },
    { label: 'Reason:', value: plData.reasonOfVisit },
    { 
      label: 'Departure Date & Time:', 
      value: new Date(plData.departureDateTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    { 
      label: 'Expected Arrival:', 
      value: new Date(plData.arrivalDateTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    { label: 'Status:', value: plData.status.toUpperCase() }
  ];
  
  visitDetails.forEach(({ label, value }) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont('helvetica', 'normal');
    
    // Handle long text wrapping for reason
    if (label === 'Reason:' && value.length > 50) {
      const lines = pdf.splitTextToSize(String(value), pageWidth - 95);
      pdf.text(lines, 70, yPos);
      yPos += (lines.length - 1) * 7;
    } else {
      pdf.text(String(value), 70, yPos);
    }
    yPos += lineHeight;
  });
  
  // QR Code Section
  if (plData.qrCode) {
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QR Code for Entry/Exit', 20, yPos);
    pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    
    // Add QR Code image
    const qrSize = 60;
    const qrX = (pageWidth - qrSize) / 2;
    yPos += 10;
    
    try {
      pdf.addImage(plData.qrCode, 'PNG', qrX, yPos, qrSize, qrSize);
      yPos += qrSize + 10;
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
    
    // Instructions
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    const instructions = [
      'Show this QR code to the warden at the hostel gate.',
      'This code will be scanned during exit and entry.'
    ];
    instructions.forEach((instruction, index) => {
      pdf.text(instruction, pageWidth / 2, yPos + (index * 6), { align: 'center' });
    });
  }
  
  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated on: ${new Date().toLocaleString('en-IN')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Save PDF
  pdf.save(`PL_${plData.regNo}_${plData.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generate PDF from Outpass data
 */
export const generateOutpassPDF = async (outpassData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OUTPASS', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('4-Hour Short Leave Pass', pageWidth / 2, 30, { align: 'center' });
  
  // Student Details Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Student Information', 20, 55);
  
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.5);
  pdf.line(20, 57, pageWidth - 20, 57);
  
  // Details
  let yPos = 70;
  const lineHeight = 10;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const details = [
    { label: 'Name:', value: outpassData.name },
    { label: 'Registration No:', value: outpassData.regNo },
    { label: 'Department:', value: outpassData.department },
    { label: 'Year of Study:', value: outpassData.yearOfStudy },
    { label: 'Hostel:', value: outpassData.hostelName },
    { label: 'Room No:', value: outpassData.roomNo },
    { label: 'Place of Visit:', value: outpassData.placeOfVisit },
    { label: 'Status:', value: outpassData.status.toUpperCase() }
  ];
  
  details.forEach(({ label, value }) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(value), 70, yPos);
    yPos += lineHeight;
  });
  
  // Time Details (if available)
  if (outpassData.exitTime || outpassData.expectedReturnTime) {
    yPos += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Time Details', 20, yPos);
    pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    
    yPos += 15;
    pdf.setFontSize(11);
    
    const timeDetails = [];
    
    if (outpassData.exitTime) {
      timeDetails.push({
        label: 'Exit Time:',
        value: new Date(outpassData.exitTime).toLocaleString('en-IN')
      });
    }
    
    if (outpassData.expectedReturnTime) {
      timeDetails.push({
        label: 'Expected Return:',
        value: new Date(outpassData.expectedReturnTime).toLocaleString('en-IN')
      });
    }
    
    if (outpassData.actualReturnTime) {
      timeDetails.push({
        label: 'Actual Return:',
        value: new Date(outpassData.actualReturnTime).toLocaleString('en-IN')
      });
    }
    
    if (outpassData.isDelayed) {
      const hours = Math.floor(outpassData.delayDuration / 60);
      const mins = outpassData.delayDuration % 60;
      timeDetails.push({
        label: '⚠️ Delayed By:',
        value: `${hours}h ${mins}m`
      });
    }
    
    timeDetails.forEach(({ label, value }) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(String(value), 70, yPos);
      yPos += lineHeight;
    });
  }
  
  // QR Code Section
  if (outpassData.qrCode) {
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QR Code for Entry/Exit', 20, yPos);
    pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    
    // Add QR Code image
    const qrSize = 60;
    const qrX = (pageWidth - qrSize) / 2;
    yPos += 10;
    
    try {
      pdf.addImage(outpassData.qrCode, 'PNG', qrX, yPos, qrSize, qrSize);
      yPos += qrSize + 10;
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
    
    // Instructions
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    const instructions = [
      'Maximum duration: 4 hours from exit time.',
      'Show this QR code to the warden at gate during exit and entry.'
    ];
    instructions.forEach((instruction, index) => {
      pdf.text(instruction, pageWidth / 2, yPos + (index * 6), { align: 'center' });
    });
  }
  
  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated on: ${new Date().toLocaleString('en-IN')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Save PDF
  pdf.save(`Outpass_${outpassData.regNo}_${outpassData.name.replace(/\s+/g, '_')}.pdf`);
};