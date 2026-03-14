const fs = require('fs');
const path = require('path');

const filePath = 'e:/Dharsini/Dhanam/Demo1/backend/controllers/wardenController.js';
const content = fs.readFileSync(filePath, 'utf8');

const startMatch = 'export const getYearlyLogs = async (req, res) => {';
const startIndex = content.indexOf(startMatch);

if (startIndex === -1) {
    console.error('Could not find start of getYearlyLogs');
    process.exit(1);
}

// Find the corresponding closing brace for the function
let braceCount = 0;
let endIndex = -1;
let foundFirstBrace = false;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        foundFirstBrace = true;
    } else if (content[i] === '}') {
        braceCount--;
    }
    
    if (foundFirstBrace && braceCount === 0) {
        endIndex = i + 1;
        break;
    }
}

if (endIndex === -1) {
    console.error('Could not find end of getYearlyLogs');
    process.exit(1);
}

const newFunction = `export const getYearlyLogs = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log('\\n--- getYearlyLogs Debug ---');
    console.log(\`Year: \${year}, Month: \${month || 'All'}, UserID: \${req.user?._id}\`);

    const warden = await Warden.findById(req.user._id);
    if (!warden) {
      console.log('Error: Warden not found for ID:', req.user._id);
      return res.status(404).json({ message: 'Warden record not found' });
    }
    console.log(\`Warden found: \${warden.name}, Hostel: \${warden.hostelName}\`);

    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    let startDate, endDate;
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return res.status(400).json({ message: 'Invalid year format' });
    }

    if (month && month !== 'all') {
      const monthIdx = parseInt(month) - 1; // 0-indexed month
      if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
        return res.status(400).json({ message: 'Invalid month format' });
      }
      startDate = new Date(yearNum, monthIdx, 1);
      endDate = new Date(yearNum, monthIdx + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }

    // Defensive check for invalid dates before toISOString()
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid Date range calculated:', { year, month });
      return res.status(400).json({ message: 'Invalid date range' });
    }

    console.log(\`Query Range: \${startDate.toISOString()} to \${endDate.toISOString()}\`);

    // Get student IDs for this hostel to filter PL logs
    const studentsInHostel = await Student.find({ hostelName: warden.hostelName }).select('_id');
    const studentIds = studentsInHostel.map(s => s._id);
    console.log(\`Found \${studentIds.length} students in hostel: \${studentIds.length}\`);

    // 1. Fetch EntryExitLogs (PL logs) filtered by students in this hostel
    console.log('Attempting to fetch PL logs...');
    let plLogs = [];
    try {
      if (studentIds.length > 0) {
        plLogs = await EntryExitLog.find({
          studentId: { $in: studentIds },
          $or: [
            { exitTime: { $gte: startDate, $lte: endDate } },
            { entryTime: { $gte: startDate, $lte: endDate } }
          ]
        }).populate('permissionLetterId')
          .populate('studentId', 'roomNo department')
          .populate('loggedBy', 'name')
          .lean();
      }
      console.log(\`Success: Found \${plLogs.length} PL logs\`);
    } catch (plErr) {
      console.error('EntryExitLog.find failed:', plErr.message);
      // Don't throw, just log and keep plLogs empty
    }

    // 2. Fetch Outpasses
    console.log('Attempting to fetch Outpass logs...');
    let outpassLogs = [];
    try {
      outpassLogs = await Outpass.find({
        hostelName: warden.hostelName,
        $or: [
          { exitTime: { $gte: startDate, $lte: endDate } },
          { actualReturnTime: { $gte: startDate, $lte: endDate } }
        ]
      }).populate('studentId', 'roomNo department')
        .populate('exitApprovedBy', 'name')
        .populate('entryApprovedBy', 'name')
        .lean();
      console.log(\`Success: Found \${outpassLogs.length} Outpass logs\`);
    } catch (opErr) {
      console.error('Outpass.find failed:', opErr.message);
      // Don't throw
    }

    // 3. Format and Combine
    const reportData = [];

    // Process PL Logs
    plLogs.forEach((log) => {
      try {
        reportData.push({
          _id: log._id,
          type: 'PL (Vacation)',
          studentName: log.studentName,
          regNo: log.regNo,
          roomNo: log.studentId?.roomNo || 'N/A',
          department: log.studentId?.department || 'N/A',
          reason: log.permissionLetterId?.reasonOfVisit || 'N/A',
          place: log.permissionLetterId?.placeOfVisit || 'N/A',
          outTime: log.exitTime,
          inTime: log.entryTime,
          status: log.entryTime ? 'Completed' : 'Still Out',
          processedBy: log.loggedBy?.name || 'Warden'
        });
      } catch (err) {
        console.error(\`Error processing PL log \${log._id}:\`, err);
      }
    });

    // Process Outpass Logs
    outpassLogs.forEach((op) => {
      try {
        reportData.push({
          _id: op._id,
          type: 'Outpass',
          studentName: op.name,
          regNo: op.regNo,
          roomNo: op.roomNo || op.studentId?.roomNo || 'N/A',
          department: op.department || op.studentId?.department || 'N/A',
          reason: 'Short Visit',
          place: op.placeOfVisit,
          outTime: op.exitTime,
          inTime: op.actualReturnTime,
          status: op.actualReturnTime ? 'Completed' : (op.exitTime ? 'Still Out' : 'Approved'),
          processedBy: op.entryApprovedBy?.name || op.exitApprovedBy?.name || 'Warden'
        });
      } catch (err) {
        console.error(\`Error processing Outpass log \${op._id}:\`, err);
      }
    });

    // Sort by outTime descending
    reportData.sort((a, b) => new Date(b.outTime || 0) - new Date(a.outTime || 0));
    
    res.json(reportData);
  } catch (error) {
    console.error('getYearlyLogs Critical Error:', error);
    res.status(500).json({ 
      message: 'Server error loading logs', 
      error: error.message 
    });
  }
};`;

const finalContent = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
fs.writeFileSync(filePath, finalContent);
console.log('Successfully updated wardenController.js');
