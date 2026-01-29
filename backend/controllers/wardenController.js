import Warden from '../models/Warden.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import PermissionLetter from '../models/PermissionLetter.js';
import EntryExitLog from '../models/EntryExitLog.js';
import { sendEmail } from '../config/email.js';
import { generateQRCode } from '../utils/generateQR.js';
import { 
  plApprovedByWardenEmail, 
  plRejectedByWardenEmail 
} from '../utils/emailTemplates.js';
import Outpass from '../models/Outpass.js';
import Attendance from '../models/Attendance.js';

export const getStats = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);

    const totalStudents = await Student.countDocuments({ 
      hostelName: warden.hostelName 
    });
    
    const studentsInHostel = await Student.countDocuments({ 
      hostelName: warden.hostelName,
      isOnVacation: false
    });
    
    const studentsOnVacation = await Student.countDocuments({ 
      hostelName: warden.hostelName,
      isOnVacation: true
    });
    
    const pendingRequests = await PermissionLetter.countDocuments({ 
      hostelName: warden.hostelName,
      status: 'parent-approved',
      wardenStatus: 'pending'
    });

    res.json({
      totalStudents,
      studentsInHostel,
      studentsOnVacation,
      pendingRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);

    const requests = await PermissionLetter.find({
      hostelName: warden.hostelName,
      status: 'parent-approved',
      wardenStatus: 'pending'
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Replace your approveRequest function with this SIMPLIFIED version
// backend/controllers/wardenController.js

export const approveRequest = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('APPROVE REQUEST - START');
    console.log('========================================');
    console.log('PL ID:', req.params.id);
    console.log('Warden User ID:', req.user?._id);
    console.log('Warden Role:', req.user?.role);
    
    // 1. Find the warden
    const warden = await Warden.findById(req.user._id);
    console.log('1. Warden lookup result:', warden ? `Found: ${warden.name}` : 'NOT FOUND');
    
    if (!warden) {
      console.log('ERROR: Warden not found in database');
      return res.status(404).json({ message: 'Warden not found' });
    }

    // 2. Find the permission letter
    const pl = await PermissionLetter.findById(req.params.id);
    console.log('2. PL lookup result:', pl ? `Found: ${pl.name}` : 'NOT FOUND');
    
    if (!pl) {
      console.log('ERROR: Permission letter not found');
      return res.status(404).json({ message: 'Permission letter not found' });
    }

    console.log('3. PL Details:');
    console.log('   - Student:', pl.name);
    console.log('   - Hostel:', pl.hostelName);
    console.log('   - Current Status:', pl.status);
    console.log('   - Warden Status:', pl.wardenStatus);

    // 3. Check if hostels match
    if (pl.hostelName !== warden.hostelName) {
      console.log('ERROR: Hostel mismatch');
      console.log(`   - PL Hostel: ${pl.hostelName}`);
      console.log(`   - Warden Hostel: ${warden.hostelName}`);
      return res.status(403).json({ message: 'Not authorized for this hostel' });
    }

    // 4. Check if already processed
    if (pl.wardenStatus !== 'pending') {
      console.log('ERROR: Already processed');
      console.log(`   - Current wardenStatus: ${pl.wardenStatus}`);
      return res.status(400).json({ 
        message: `This request has already been ${pl.wardenStatus}` 
      });
    }

    console.log('4. Validation passed - proceeding with approval');

    // 5. Generate QR Code
    console.log('5. Generating QR Code...');
    
    const qrData = {
      plId: pl._id.toString(),
      studentId: pl.studentId.toString(),
      regNo: pl.regNo,
      name: pl.name,
      roomNo: pl.roomNo,
      hostelName: pl.hostelName,
      placeOfVisit: pl.placeOfVisit,
      arrivalDateTime: pl.arrivalDateTime.toISOString(),
      type: 'permission-letter'
    };
    
    console.log('   QR Data prepared:', JSON.stringify(qrData, null, 2));
    
    let qrCode;
    try {
      qrCode = await generateQRCode(qrData);
      console.log('   ✓ QR Code generated successfully');
      console.log('   QR Code length:', qrCode.length, 'characters');
    } catch (qrError) {
      console.error('   ✗ QR generation FAILED:', qrError.message);
      console.error('   QR Error stack:', qrError.stack);
      return res.status(500).json({ 
        message: 'Failed to generate QR code',
        error: qrError.message 
      });
    }

    // 6. Update the permission letter
    console.log('6. Updating Permission Letter...');
    
    pl.wardenStatus = 'approved';
    pl.status = 'approved';
    pl.qrCode = qrCode;
    pl.approvedAt = new Date();
    
    try {
      await pl.save();
      console.log('   ✓ Permission letter saved successfully');
    } catch (saveError) {
      console.error('   ✗ Save FAILED:', saveError.message);
      console.error('   Save error stack:', saveError.stack);
      return res.status(500).json({ 
        message: 'Failed to save permission letter',
        error: saveError.message 
      });
    }

    // 7. Try to send email (optional - don't fail if this fails)
    console.log('7. Attempting to send email notification...');
    try {
      const student = await Student.findOne({ regNo: pl.regNo });
      
      if (student && student.email) {
        console.log('   Student email found:', student.email);
        
        try {
          const emailHtml = plApprovedByWardenEmail(student.name, {
            placeOfVisit: pl.placeOfVisit,
            departureDateTime: pl.departureDateTime,
            arrivalDateTime: pl.arrivalDateTime
          });
          
          await sendEmail(
            student.email,
            'Permission Letter Approved',
            emailHtml
          );
          console.log('   ✓ Email sent successfully');
        } catch (emailError) {
          console.log('   ⚠ Email failed (non-critical):', emailError.message);
          // Continue - email is not critical
        }
      } else {
        console.log('   ⚠ No student email found - skipping email');
      }
    } catch (emailLookupError) {
      console.log('   ⚠ Student lookup failed (non-critical):', emailLookupError.message);
      // Continue - email is not critical
    }

    console.log('========================================');
    console.log('APPROVE REQUEST - SUCCESS ✓');
    console.log('========================================\n');

    // 8. Send success response
    res.status(200).json({ 
      message: 'Request approved successfully',
      permissionLetter: {
        _id: pl._id,
        name: pl.name,
        regNo: pl.regNo,
        status: pl.status,
        wardenStatus: pl.wardenStatus
      }
    });

  } catch (error) {
    console.error('\n========================================');
    console.error('APPROVE REQUEST - UNEXPECTED ERROR ✗');
    console.error('========================================');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================\n');
    
    res.status(500).json({ 
      message: 'Failed to approve request',
      error: error.message,
      errorType: error.name
    });
  }
};
export const rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const warden = await Warden.findById(req.user._id);
    const pl = await PermissionLetter.findById(req.params.id);

    if (!pl) {
      return res.status(404).json({ message: 'Permission letter not found' });
    }

    if (pl.hostelName !== warden.hostelName) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (pl.wardenStatus !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update permission letter status
    pl.wardenStatus = 'rejected';
    pl.status = 'rejected';
    pl.rejectionReason = reason || 'Rejected by warden';
    await pl.save();

    // Get student and parent details
    const student = await Student.findOne({ regNo: pl.regNo });
    const parent = await Parent.findOne({ studentRegNo: pl.regNo });
    
    if (student) {
      // Send email to student
      const emailHtml = plRejectedByWardenEmail(
        student.name, 
        parent?.email,
        {
          placeOfVisit: pl.placeOfVisit,
          departureDateTime: pl.departureDateTime,
          arrivalDateTime: pl.arrivalDateTime
        },
        reason
      );
      
      await sendEmail(
        student.email,
        'Permission Letter Rejected by Warden',
        emailHtml
      );

      // Send email to parent as well
      if (parent) {
        await sendEmail(
          parent.email,
          'Permission Letter Rejected by Warden',
          emailHtml
        );
      }
    }

    res.json({ 
      message: 'Request rejected successfully',
      permissionLetter: pl 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudents = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);
    const { filter } = req.query;

    let query = { hostelName: warden.hostelName };

    if (filter === 'in-hostel') {
      query.isOnVacation = false;
    } else if (filter === 'on-vacation') {
      query.isOnVacation = true;
    }

    const students = await Student.find(query)
      .select('-password')
      .sort({ roomNo: 1 });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify QR Code without logging
export const verifyQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { plId, studentId, regNo } = parsedData;

    // Verify permission letter
    const pl = await PermissionLetter.findById(plId);
    if (!pl || pl.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid or unapproved permission letter' });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if log already exists
    const log = await EntryExitLog.findOne({ permissionLetterId: plId });

    let action;
    let currentStatus;

    if (!log || !log.exitTime) {
      // No exit logged yet - this is an EXIT action
      action = 'exit';
      currentStatus = 'In Hostel';
    } else if (log.exitTime && !log.entryTime) {
      // Exit logged but no entry - this is an ENTRY action
      action = 'entry';
      currentStatus = 'On Vacation';
    } else {
      // Both exit and entry logged
      return res.status(400).json({ 
        message: 'This permission letter has already been fully processed' 
      });
    }

    res.json({
      success: true,
      data: {
        studentName: pl.name,
        regNo: pl.regNo,
        roomNo: pl.roomNo,
        placeOfVisit: pl.placeOfVisit,
        arrivalDateTime: pl.arrivalDateTime,
        action,
        currentStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// THIS IS THE FUNCTION YOU ASKED ABOUT - Log entry or exit after confirmation
export const logEntryExit = async (req, res) => {
  try {
    const { qrData, action } = req.body;
    const wardenId = req.user._id;

    if (!qrData || !action) {
      return res.status(400).json({ message: 'QR data and action are required' });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { plId, studentId, regNo, name } = parsedData;

    // Verify permission letter
    const pl = await PermissionLetter.findById(plId);
    if (!pl || pl.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid or unapproved permission letter' });
    }

    // Check if already expired/fully used
    if (pl.status === 'expired' || pl.isFullyUsed) {
      return res.status(400).json({ 
        message: 'This permission letter has expired. Student must request a new PL.' 
      });
    }

    // Check if log already exists
    let log = await EntryExitLog.findOne({ permissionLetterId: plId });

    if (action === 'exit') {
      if (log && log.exitTime) {
        return res.status(400).json({ message: 'Exit already logged for this permission letter' });
      }

      if (!log) {
        // Create new log with exit time
        log = await EntryExitLog.create({
          permissionLetterId: plId,
          studentId,
          studentName: name,
          regNo,
          exitTime: new Date(),
          loggedBy: wardenId
        });
      } else {
        // Update existing log
        log.exitTime = new Date();
        await log.save();
      }

      // Update student vacation status to true (on vacation)
      await Student.findById(studentId).updateOne({ isOnVacation: true });

      return res.json({
        success: true,
        message: `✓ Exit logged successfully. ${name} is now marked as ON VACATION`,
        data: {
          action: 'EXIT',
          studentName: name,
          regNo,
          timestamp: log.exitTime
        }
      });
    } else if (action === 'entry') {
      if (!log || !log.exitTime) {
        return res.status(400).json({ message: 'No exit record found. Student must exit first.' });
      }

      if (log.entryTime) {
        return res.status(400).json({ message: 'Entry already logged for this permission letter' });
      }

      // Update with entry time
      log.entryTime = new Date();
      await log.save();

      // Update student vacation status to false (in hostel)
      await Student.findById(studentId).updateOne({ isOnVacation: false });

      // Mark permission letter as EXPIRED (fully used)
      pl.status = 'expired';
      pl.isFullyUsed = true;
      pl.usedAt = new Date();
      await pl.save();

      return res.json({
        success: true,
        message: `✓ Entry logged successfully. ${name} has returned to the hostel`,
        data: {
          action: 'ENTRY',
          studentName: name,
          regNo,
          timestamp: log.entryTime
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be "exit" or "entry"' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentsForAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const warden = await Warden.findById(req.user._id);

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Get all students in warden's hostel
    const students = await Student.find({ 
      hostelName: warden.hostelName 
    }).select('-password').sort({ roomNo: 1 });

    // Get attendance records for this date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      hostelName: warden.hostelName,
      date: attendanceDate
    });

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record;
    });

    // Combine student data with attendance data
    const studentsWithAttendance = students.map(student => {
      const attendance = attendanceMap[student._id.toString()];
      return {
        _id: student._id,
        regNo: student.regNo,
        name: student.name,
        roomNo: student.roomNo,
        department: student.department,
        yearOfStudy: student.yearOfStudy,
        isOnVacation: student.isOnVacation,
        attendance: attendance ? {
          status: attendance.status,
          _id: attendance._id
        } : null
      };
    });

    res.json({
      date: attendanceDate,
      students: studentsWithAttendance
    });
  } catch (error) {
    console.error('Get Students For Attendance Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    const wardenId = req.user._id;
    const warden = await Warden.findById(wardenId);

    if (!date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    for (const record of attendanceData) {
      const { studentId, status } = record;

      // Get student details
      const student = await Student.findById(studentId);
      
      if (!student || student.hostelName !== warden.hostelName) {
        continue; // Skip if student not found or not in warden's hostel
      }

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        studentId,
        date: attendanceDate
      });

      if (existingAttendance) {
        // Update existing attendance (only if not on vacation or if vacation status changed)
        if (!existingAttendance.isOnVacation) {
          existingAttendance.status = status;
          existingAttendance.isOnVacation = student.isOnVacation;
          await existingAttendance.save();
          results.push({ studentId, status: 'updated' });
        }
      } else {
        // Create new attendance record
        await Attendance.create({
          studentId,
          studentName: student.name,
          regNo: student.regNo,
          hostelName: student.hostelName,
          date: attendanceDate,
          status: student.isOnVacation ? 'absent' : status,
          isOnVacation: student.isOnVacation,
          markedBy: wardenId
        });
        results.push({ studentId, status: 'created' });
      }
    }

    res.json({
      message: 'Attendance marked successfully',
      results
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance report
export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const warden = await Warden.findById(req.user._id);

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      hostelName: warden.hostelName,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1, regNo: 1 });

    // Group by student
    const studentAttendance = {};
    
    attendanceRecords.forEach(record => {
      const studentKey = record.studentId.toString();
      
      if (!studentAttendance[studentKey]) {
        studentAttendance[studentKey] = {
          studentId: record.studentId,
          studentName: record.studentName,
          regNo: record.regNo,
          records: []
        };
      }
      
      studentAttendance[studentKey].records.push({
        date: record.date,
        status: record.status,
        isOnVacation: record.isOnVacation
      });
    });

    res.json({
      startDate: start,
      endDate: end,
      attendance: Object.values(studentAttendance)
    });
  } catch (error) {
    console.error('Get Attendance Report Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOutpassQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    if (parsedData.type !== 'outpass') {
      return res.status(400).json({ message: 'This is not an outpass QR code' });
    }

    const { studentId, regNo } = parsedData;

    const outpass = await Outpass.findOne({
      studentId,
      regNo,
      status: 'active'
    });

    if (!outpass) {
      return res.status(404).json({ message: 'No active outpass found for this student' });
    }

    let action;
    let currentStatus;

    if (!outpass.exitTime) {
      action = 'exit';
      currentStatus = 'In Hostel';
    } else if (outpass.exitTime && !outpass.actualReturnTime) {
      action = 'entry';
      currentStatus = 'Out on Outpass';
    } else {
      return res.status(400).json({ 
        message: 'This outpass has already been completed' 
      });
    }

    res.json({
      success: true,
      data: {
        outpassId: outpass._id,
        studentName: outpass.name,
        regNo: outpass.regNo,
        roomNo: outpass.roomNo,
        placeOfVisit: outpass.placeOfVisit,
        action,
        currentStatus,
        exitTime: outpass.exitTime,
        expectedReturnTime: outpass.expectedReturnTime
      }
    });
  } catch (error) {
    console.error('Verify Outpass QR Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logOutpassAction = async (req, res) => {
  try {
    const { qrData, action } = req.body;
    const wardenId = req.user._id;

    if (!qrData || !action) {
      return res.status(400).json({ message: 'QR data and action are required' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { studentId, regNo, name } = parsedData;

    const outpass = await Outpass.findOne({
      studentId,
      regNo,
      status: 'active'
    });

    if (!outpass) {
      return res.status(404).json({ message: 'No active outpass found' });
    }

    if (action === 'exit') {
      if (outpass.exitTime) {
        return res.status(400).json({ message: 'Exit already logged for this outpass' });
      }

      const exitTime = new Date();
      const expectedReturnTime = new Date(exitTime.getTime() + 4 * 60 * 60 * 1000);

      outpass.exitTime = exitTime;
      outpass.expectedReturnTime = expectedReturnTime;
      outpass.exitApprovedBy = wardenId;
      await outpass.save();

      return res.json({
        success: true,
        message: `✓ Exit logged successfully. ${name} must return by ${expectedReturnTime.toLocaleTimeString()}`,
        data: {
          action: 'EXIT',
          studentName: name,
          regNo,
          exitTime,
          expectedReturnTime
        }
      });

    } else if (action === 'entry') {
      if (!outpass.exitTime) {
        return res.status(400).json({ message: 'No exit record found. Student must exit first.' });
      }

      if (outpass.actualReturnTime) {
        return res.status(400).json({ message: 'Entry already logged for this outpass' });
      }

      const actualReturnTime = new Date();
      const expectedReturnTime = new Date(outpass.expectedReturnTime);
      
      const delayInMinutes = Math.floor((actualReturnTime - expectedReturnTime) / (1000 * 60));
      const isDelayed = delayInMinutes > 0;

      outpass.actualReturnTime = actualReturnTime;
      outpass.status = 'completed';
      outpass.isDelayed = isDelayed;
      outpass.delayDuration = isDelayed ? delayInMinutes : 0;
      outpass.entryApprovedBy = wardenId;
      await outpass.save();

      let message = `✓ Entry logged successfully. ${name} has returned to the hostel`;
      if (isDelayed) {
        message += ` (Delayed by ${delayInMinutes} minutes)`;
      }

      return res.json({
        success: true,
        message,
        data: {
          action: 'ENTRY',
          studentName: name,
          regNo,
          actualReturnTime,
          isDelayed,
          delayDuration: delayInMinutes
        }
      });

    } else {
      return res.status(400).json({ message: 'Invalid action. Must be "exit" or "entry"' });
    }
  } catch (error) {
    console.error('Log Outpass Action Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Replace your getDelayedStudents function in wardenController.js with this:

export const getDelayedStudents = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);
    const currentTime = new Date();

    // 1. Get completed outpasses that were delayed
    const completedDelayedStudents = await Outpass.find({
      hostelName: warden.hostelName,
      isDelayed: true,
      status: 'completed'
    }).sort({ actualReturnTime: -1 });

    // 2. Get active outpasses where expected return time has passed (currently delayed)
    const activeOutpasses = await Outpass.find({
      hostelName: warden.hostelName,
      status: 'active',
      exitTime: { $ne: null },
      actualReturnTime: null  // Haven't returned yet
    });

    // Check which active outpasses are currently delayed
    const currentlyDelayedStudents = [];
    
    for (const outpass of activeOutpasses) {
      const expectedReturn = new Date(outpass.expectedReturnTime);
      
      if (currentTime > expectedReturn) {
        // This student is currently delayed (still out past 4 hours)
        const delayMinutes = Math.floor((currentTime - expectedReturn) / (1000 * 60));
        
        currentlyDelayedStudents.push({
          ...outpass.toObject(),
          delayDuration: delayMinutes,
          isCurrentlyDelayed: true,
          status: 'active-delayed' // Custom status for display
        });
      }
    }

    // 3. Combine both lists
    const allDelayedStudents = [
      ...currentlyDelayedStudents,  // Currently delayed (still out)
      ...completedDelayedStudents.map(s => ({
        ...s.toObject(),
        isCurrentlyDelayed: false
      }))
    ];

    // Sort by delay duration (most delayed first)
    allDelayedStudents.sort((a, b) => b.delayDuration - a.delayDuration);

    res.json(allDelayedStudents);
  } catch (error) {
    console.error('Get Delayed Students Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getActiveOutpasses = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);

    const activeOutpasses = await Outpass.find({
      hostelName: warden.hostelName,
      status: 'active',
      exitTime: { $ne: null }
    }).sort({ exitTime: -1 });

    const now = new Date();
    const updatedOutpasses = activeOutpasses.map(outpass => {
      const expectedReturn = new Date(outpass.expectedReturnTime);
      const isCurrentlyDelayed = now > expectedReturn;
      
      return {
        ...outpass.toObject(),
        isCurrentlyDelayed,
        currentDelayMinutes: isCurrentlyDelayed 
          ? Math.floor((now - expectedReturn) / (1000 * 60)) 
          : 0
      };
    });

    res.json(updatedOutpasses);
  } catch (error) {
    console.error('Get Active Outpasses Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this new function to wardenController.js

export const getDelayedVacationStudents = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);
    
    if (!warden) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    const currentDateTime = new Date();

    console.log('=== CHECKING DELAYED VACATION STUDENTS ===');
    console.log('Warden:', warden.name, '| Hostel:', warden.hostelName);
    console.log('Current Time:', currentDateTime.toISOString());

    // Find PLs where:
    // 1. Arrival date has passed
    // 2. Status is 'approved' OR (status is 'expired' but not fully used)
    // 3. Belongs to warden's hostel
    const expiredPLs = await PermissionLetter.find({
      hostelName: warden.hostelName,
      arrivalDateTime: { $lt: currentDateTime },
      $or: [
        { status: 'approved' },
        { 
          status: 'expired',
          isFullyUsed: { $ne: true }
        }
      ]
    });

    console.log(`Found ${expiredPLs.length} PLs with passed arrival dates in ${warden.hostelName}`);

    const delayedVacationStudents = [];

    for (const pl of expiredPLs) {
      // Check if exit is logged but entry is not
      const exitLog = await EntryExitLog.findOne({
        permissionLetterId: pl._id,
        exitTime: { $ne: null },
        entryTime: null
      });

      if (exitLog) {
        // Get student details
        const student = await Student.findById(pl.studentId);
        
        if (student && student.isOnVacation) {
          // Calculate delay duration in minutes
          const arrivalTime = new Date(pl.arrivalDateTime);
          const delayInMinutes = Math.floor((currentDateTime - arrivalTime) / (1000 * 60));
          
          console.log(`✅ DELAYED: ${pl.name} (${pl.regNo}) - ${delayInMinutes} minutes late`);
          
          delayedVacationStudents.push({
            _id: pl._id,
            studentId: pl.studentId,
            regNo: pl.regNo,
            name: pl.name,
            department: pl.department,
            roomNo: pl.roomNo,
            hostelName: pl.hostelName,
            placeOfVisit: pl.placeOfVisit,
            reasonOfVisit: pl.reasonOfVisit,
            departureDateTime: pl.departureDateTime,
            arrivalDateTime: pl.arrivalDateTime,
            exitTime: exitLog.exitTime,
            delayDuration: delayInMinutes,
            isOnVacation: true
          });
        }
      }
    }

    // Sort by delay duration (most delayed first)
    delayedVacationStudents.sort((a, b) => b.delayDuration - a.delayDuration);

    console.log(`\n=== RESULT: ${delayedVacationStudents.length} delayed vacation students ===\n`);

    res.json(delayedVacationStudents);
  } catch (error) {
    console.error('Get Delayed Vacation Students Error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};