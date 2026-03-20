import Warden from '../models/Warden.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import PermissionLetter from '../models/PermissionLetter.js';
import EntryExitLog from '../models/EntryExitLog.js';
import { sendEmail } from '../config/email.js';
import { generateQRCode } from '../utils/generateQR.js';
import {
  plApprovedByWardenEmail,
  plRejectedByWardenEmail,
  outpassCreatedEmail,
  outpassCompletedEmail,
  plApprovedByWardenEmailToParent,
  plRejectedByWardenEmailToParent,
  studentDelayParentEmail
} from '../utils/emailTemplates.js';
import Outpass from '../models/Outpass.js';

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

    // Get pending requests and filter out orphaned records
    const allPendingRequests = await PermissionLetter.find({
      hostelName: warden.hostelName,
      status: 'parent-approved',
      wardenStatus: 'pending'
    });

    console.log('\n=== PENDING REQUESTS STATS DEBUG ===');
    console.log(`Hostel: ${warden.hostelName}`);
    console.log(`Total pending from DB: ${allPendingRequests.length}`);

    if (allPendingRequests.length > 0) {
      console.log('Pending requests details:');
      allPendingRequests.forEach((req, idx) => {
        console.log(`  [${idx}] ${req.name} (${req.regNo}) - StudentID: ${req.studentId}`);
      });
    }

    // Filter out requests for non-existent students
    let validPendingCount = 0;
    for (const request of allPendingRequests) {
      const studentExists = await Student.findById(request.studentId);
      if (studentExists) {
        validPendingCount++;
        console.log(`✓ Valid request: ${request.name} (${request.regNo})`);
      } else {
        console.log(`✗ Orphaned request: ${request.name} (${request.regNo}) - Student not found`);
      }
    }

    console.log(`Result: ${validPendingCount} valid requests`);
    console.log('=====================================\n');

    res.json({
      totalStudents,
      studentsInHostel,
      studentsOnVacation,
      pendingRequests: validPendingCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const warden = await Warden.findById(req.user._id);

    // First get all pending requests
    const allRequests = await PermissionLetter.find({
      hostelName: warden.hostelName,
      status: 'parent-approved',
      wardenStatus: 'pending'
    }).sort({ regNo: 1 });

    // Filter out requests for non-existent students
    const validRequests = [];
    for (const request of allRequests) {
      const studentExists = await Student.findById(request.studentId);
      if (studentExists) {
        validRequests.push(request);
      } else {
        console.log(`Removing orphaned request for deleted student: ${request.name} (${request.regNo})`);
        // Optionally delete the orphaned request
        // await PermissionLetter.findByIdAndDelete(request._id);
      }
    }

    console.log(`Found ${allRequests.length} total pending requests, ${validRequests.length} valid requests`);
    res.json(validRequests);
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
      const parent = await Parent.findOne({ studentRegNo: pl.regNo });

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
            'Permission Letter Approved - Hostel Portal',
            emailHtml
          );
          console.log('   ✓ Student email sent successfully');
        } catch (emailError) {
          console.log('   ⚠ Student email failed (non-critical):', emailError.message);
        }

        // Send email to parent as well
        if (parent && parent.email) {
          console.log('   Parent email found:', parent.email);
          try {
            const parentEmailHtml = plApprovedByWardenEmailToParent(student.name, parent.name, {
              placeOfVisit: pl.placeOfVisit,
              departureDateTime: pl.departureDateTime,
              arrivalDateTime: pl.arrivalDateTime
            });

            await sendEmail(
              parent.email,
              'Your Ward\'s Permission Letter Approved - Hostel Portal',
              parentEmailHtml
            );
            console.log('   ✓ Parent email sent successfully');
          } catch (parentEmailError) {
            console.log('   ⚠ Parent email failed (non-critical):', parentEmailError.message);
          }
        } else {
          console.log('   ⚠ No parent email found - skipping parent notification');
        }
      } else {
        console.log('   ⚠ No student email found - skipping all emails');
      }
    } catch (emailLookupError) {
      console.log('   ⚠ Email lookup failed (non-critical):', emailLookupError.message);
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

    // Send email to student
    if (student) {
      const studentEmailHtml = plRejectedByWardenEmail(
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
        'Permission Letter Rejected by Warden - Hostel Portal',
        studentEmailHtml
      );
      console.log('   ✓ Student rejection email sent');
    }

    // Send email to parent with parent-specific template
    if (parent && parent.email) {
      const parentEmailHtml = plRejectedByWardenEmailToParent(
        student?.name || 'Student',
        parent.name,
        {
          placeOfVisit: pl.placeOfVisit,
          departureDateTime: pl.departureDateTime,
          arrivalDateTime: pl.arrivalDateTime
        },
        reason
      );

      await sendEmail(
        parent.email,
        'Your Ward\'s Permission Letter Rejected - Hostel Portal',
        parentEmailHtml
      );
      console.log('   ✓ Parent rejection email sent');
    } else {
      console.log('   ⚠ No parent email found - skipping parent notification');
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
      .sort({ regNo: 1 });

    // Get all active outpasses for this hostel where students have exited but not returned
    // We remove status: 'active' to be more robust - if they have an exit time but no return, they are "out"
    const activeOutpasses = await Outpass.find({
      hostelName: warden.hostelName,
      exitTime: { $ne: null },
      actualReturnTime: null
    }).select('studentId');

    const outpassStudentIds = new Set(activeOutpasses.map(op => op.studentId.toString()));

    // Enhance with outpass status
    const studentsWithStatus = students.map(student => ({
      ...student.toObject(),
      isOnOutpass: outpassStudentIds.has(student._id.toString())
    }));

    // Filter results based on outpass status if needed
    let finalStudents = studentsWithStatus;
    if (filter === 'in-hostel') {
      finalStudents = studentsWithStatus.filter(s => !s.isOnVacation && !s.isOnOutpass);
    } else if (filter === 'on-outpass') {
      finalStudents = studentsWithStatus.filter(s => s.isOnOutpass);
    }

    res.json(finalStudents);
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
      console.error('Error parsing QR data:', error.message);
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { plId, studentId, regNo } = parsedData;
    console.log(`Verifying PL QR: plId=${plId}, studentId=${studentId}, regNo=${regNo}`);

    // Verify permission letter
    if (!plId) {
      console.log('Error: plId missing in QR data');
      return res.status(400).json({ message: 'Invalid QR code: missing PL ID' });
    }

    const pl = await PermissionLetter.findById(plId);
    if (!pl) {
      console.log(`Error: Permission letter not found for ID: ${plId}`);
      return res.status(400).json({ message: 'Invalid or unapproved permission letter (Not Found)' });
    }

    console.log(`PL found: status=${pl.status}, studentId=${pl.studentId}`);

    if (pl.status !== 'approved') {
      console.log(`Error: PL status is ${pl.status}, expected "approved"`);
      return res.status(400).json({ message: 'Invalid or unapproved permission letter' });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      console.log(`Error: Student not found for ID: ${studentId}`);
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

      // ── DEPARTURE TIME RESTRICTION ──────────────────────────────────────
      // Block exit if current time is before the scheduled departure time
      const now = new Date();
      const departureTime = new Date(pl.departureDateTime);
      if (now < departureTime) {
        const formattedDeparture = departureTime.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        return res.status(400).json({
          message: `🚫 Student is not allowed to leave before the departure time. Scheduled departure: ${formattedDeparture}`
        });
      }
      // ────────────────────────────────────────────────────────────────────
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
        departureDateTime: pl.departureDateTime,
        arrivalDateTime: pl.arrivalDateTime,
        action,
        currentStatus,
        profilePhoto: student.profilePhoto || null
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

    // Check if already logo already exists
    let log = await EntryExitLog.findOne({ permissionLetterId: plId });

    if (action === 'exit') {
      // ── DEPARTURE TIME RESTRICTION (server-side guard) ───────────────────
      const now = new Date();
      const departureTime = new Date(pl.departureDateTime);
      if (now < departureTime) {
        const formattedDeparture = departureTime.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        return res.status(400).json({
          message: `🚫 Exit not allowed before departure time. Scheduled departure: ${formattedDeparture}`
        });
      }
      // ────────────────────────────────────────────────────────────────────

      // NEW: Check if student is already out on an outpass
      const activeOutpass = await Outpass.findOne({
        studentId,
        exitTime: { $ne: null },
        actualReturnTime: null,
        status: 'active'
      });

      if (activeOutpass) {
        return res.status(400).json({
          message: `Cannot log PL exit. Student is currently out on an Outpass (to ${activeOutpass.placeOfVisit}). They must return and log entry first.`
        });
      }

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
      const actualReturnTime = new Date();
      log.entryTime = actualReturnTime;
      await log.save();

      // Check for delay
      const arrivalDateTime = new Date(pl.arrivalDateTime);
      const delayInMinutes = Math.floor((actualReturnTime - arrivalDateTime) / (1000 * 60));
      const isDelayed = delayInMinutes > 0;

      // Update student vacation status to false (in hostel)
      await Student.findById(studentId).updateOne({ isOnVacation: false });

      // Send delay notification email to parent
      if (isDelayed) {
        try {
          const student = await Student.findById(studentId);
          const parent = await Parent.findOne({ studentRegNo: regNo });
          if (student && parent && parent.email) {
            const emailHtml = studentDelayParentEmail(student.name, parent.name, {
              delayDuration: delayInMinutes,
              placeOfVisit: pl.placeOfVisit,
              expectedReturnTime: arrivalDateTime,
              actualReturnTime: actualReturnTime
            });
            await sendEmail(
              parent.email,
              '⚠️ Student Delay Notification - Hostel Portal',
              emailHtml
            );
            console.log(`   ✓ Parent delay notification sent for student ${student.name}`);
          }
        } catch (emailError) {
          console.log('Parent delay notification failed (non-critical):', emailError.message);
        }
      }

      // Mark permission letter as EXPIRED (fully used)
      pl.status = 'expired';
      pl.isFullyUsed = true;
      pl.usedAt = new Date();
      await pl.save();

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
          timestamp: log.entryTime,
          isDelayed,
          delayDuration: delayInMinutes
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

    // Get student details for profile photo
    const student = await Student.findById(studentId);

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
        expectedReturnTime: outpass.expectedReturnTime,
        profilePhoto: student?.profilePhoto || null
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
      // NEW: Check if student is already on vacation (out via PL)
      const student = await Student.findById(studentId);
      if (student && student.isOnVacation) {
        return res.status(400).json({
          message: 'Cannot log Outpass exit. Student is currently on vacation (Permission Letter). They must return to the hostel first.'
        });
      }

      if (outpass.exitTime) {
        return res.status(400).json({ message: 'Exit already logged for this outpass' });
      }

      const exitTime = new Date();
      const expectedReturnTime = new Date(exitTime.getTime() + 4 * 60 * 60 * 1000);

      outpass.exitTime = exitTime;
      outpass.expectedReturnTime = expectedReturnTime;
      outpass.exitApprovedBy = wardenId;
      await outpass.save();

      // Send exit notification email
      try {
        const student = await Student.findById(outpass.studentId);
        if (student && student.email) {
          const emailHtml = outpassCreatedEmail(student.name, outpass.placeOfVisit);
          await sendEmail(
            student.email,
            'Outpass Exit Logged',
            emailHtml
          );
        }
      } catch (emailError) {
        console.log('Email notification failed (non-critical):', emailError.message);
      }

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

      // Send completion notification email
      try {
        const student = await Student.findById(outpass.studentId);
        if (student && student.email) {
          const emailHtml = outpassCompletedEmail(student.name, outpass.placeOfVisit);
          await sendEmail(
            student.email,
            'Outpass Completed - Welcome Back',
            emailHtml
          );
        }

        // Send delay notification to parent if delayed
        if (isDelayed) {
          const parent = await Parent.findOne({ studentRegNo: regNo });
          if (student && parent && parent.email) {
            const delayEmailHtml = studentDelayParentEmail(student.name, parent.name, {
              delayDuration: delayInMinutes,
              placeOfVisit: outpass.placeOfVisit,
              expectedReturnTime: expectedReturnTime,
              actualReturnTime: actualReturnTime
            });
            await sendEmail(
              parent.email,
              '⚠️ Student Delay Notification (Outpass) - Hostel Portal',
              delayEmailHtml
            );
            console.log(`   ✓ Parent delay notification sent (Outpass) for student ${student.name}`);
          }
        }
      } catch (emailError) {
        console.log('Email notification failed (non-critical):', emailError.message);
      }

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

    // Check which active outpasses are currently delayed and filter orphaned records
    const currentlyDelayedStudents = [];

    for (const outpass of activeOutpasses) {
      // Check if student still exists
      const studentExists = await Student.findById(outpass.studentId);
      if (!studentExists) {
        console.log(`Removing orphaned delayed outpass for deleted student: ${outpass.name} (${outpass.regNo})`);
        continue;
      }

      const expectedReturn = new Date(outpass.expectedReturnTime);

      if (currentTime > expectedReturn) {
        // This student is currently delayed (still out past 4 hours)
        const delayMinutes = Math.floor((currentTime - expectedReturn) / (1000 * 60));

        currentlyDelayedStudents.push({
          ...outpass.toObject(),
          delayDuration: delayMinutes,
          isCurrentlyDelayed: true,
          status: 'active-delayed', // Custom status for display
          expectedReturnTimeFormatted: expectedReturn.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          exitTimeFormatted: new Date(outpass.exitTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    }

    // 3. Combine both lists and filter orphaned records from completed list
    const validCompletedDelayed = [];

    for (const s of completedDelayedStudents) {
      const studentExists = await Student.findById(s.studentId);
      if (studentExists) {
        validCompletedDelayed.push({
          ...s.toObject(),
          isCurrentlyDelayed: false,
          expectedReturnTimeFormatted: new Date(s.expectedReturnTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          exitTimeFormatted: new Date(s.exitTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          actualReturnTimeFormatted: s.actualReturnTime
            ? new Date(s.actualReturnTime).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            : null
        });
      } else {
        console.log(`Removing orphaned completed delayed outpass for deleted student: ${s.name} (${s.regNo})`);
      }
    }

    const allDelayedStudents = [
      ...currentlyDelayedStudents,  // Currently delayed (still out)
      ...validCompletedDelayed
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

    const allActiveOutpasses = await Outpass.find({
      hostelName: warden.hostelName,
      status: 'active',
      exitTime: { $ne: null }
    }).sort({ exitTime: -1 });

    // Filter out orphaned outpasses and calculate delays
    const validOutpasses = [];
    const now = new Date();

    for (const outpass of allActiveOutpasses) {
      const studentExists = await Student.findById(outpass.studentId);
      if (!studentExists) {
        console.log(`Removing orphaned active outpass for deleted student: ${outpass.name} (${outpass.regNo})`);
        continue;
      }

      const expectedReturn = new Date(outpass.expectedReturnTime);
      const isCurrentlyDelayed = now > expectedReturn;
      const currentDelayMinutes = isCurrentlyDelayed
        ? Math.floor((now - expectedReturn) / (1000 * 60))
        : 0;

      validOutpasses.push({
        ...outpass.toObject(),
        isCurrentlyDelayed,
        currentDelayMinutes,
        expectedReturnTimeFormatted: expectedReturn.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        exitTimeFormatted: new Date(outpass.exitTime).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }

    console.log(`Active outpasses: ${allActiveOutpasses.length} total, ${validOutpasses.length} valid`);
    res.json(validOutpasses);
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

    console.log('\n=== Fetching Delayed Vacation Students ===');
    console.log('Current time:', currentDateTime.toLocaleString('en-IN'));

    // Find PLs where:
    // 1. Arrival date has passed (for currently out students)
    // 2. Or if returned late (we fetch expired/completed ones too)
    // 3. Belongs to warden's hostel
    const expiredPLs = await PermissionLetter.find({
      hostelName: warden.hostelName,
      $or: [
        { status: 'approved', arrivalDateTime: { $lt: currentDateTime } }, // Still out and late
        { status: 'expired', isFullyUsed: true } // Checked later to see IF they arrived late
      ]
    });

    console.log(`Found ${expiredPLs.length} PLs to check for delays`);

    const delayedVacationStudents = [];

    for (const pl of expiredPLs) {
      // Check if student still exists (filter orphaned records)
      const studentExists = await Student.findById(pl.studentId);
      if (!studentExists) {
        console.log(`Removing orphaned delayed vacation record for deleted student: ${pl.name} (${pl.regNo})`);
        continue;
      }

      // We need to find the entry/exit log to determine if they actually returned delayed
      const log = await EntryExitLog.findOne({
        permissionLetterId: pl._id,
        exitTime: { $ne: null }
      });

      if (log) {
        const arrivalTime = new Date(pl.arrivalDateTime);
        let delayInMinutes = 0;
        let isCurrentlyDelayed = false;

        if (log.entryTime) {
          // They have returned, check if they returned late
          const actualReturnTime = new Date(log.entryTime);
          if (actualReturnTime > arrivalTime) {
            delayInMinutes = Math.floor((actualReturnTime - arrivalTime) / (1000 * 60));
          }
        } else {
          // They have NOT returned yet, check if currently late
          const now = currentDateTime;
          if (now > arrivalTime) {
            delayInMinutes = Math.floor((now - arrivalTime) / (1000 * 60));
            isCurrentlyDelayed = true;
          }
        }

        // Only add to delayed list if delayInMinutes > 0
        if (delayInMinutes > 0) {
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
            exitTime: log.exitTime,
            actualReturnTime: log.entryTime, // will be null if still out
            isCurrentlyDelayed,
            delayDuration: delayInMinutes,
            arrivalDateTimeFormatted: arrivalTime.toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            exitTimeFormatted: new Date(log.exitTime).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            actualReturnTimeFormatted: log.entryTime ? new Date(log.entryTime).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : null
          });
        }
      }
    }

    console.log(`\nTotal delayed vacation students found: ${delayedVacationStudents.length}`);
    console.log('==========================================\n');

    // Sort by delay duration (most delayed first)
    delayedVacationStudents.sort((a, b) => b.delayDuration - a.delayDuration);

    res.json(delayedVacationStudents);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const getYearlyLogs = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log('\n--- getYearlyLogs Debug ---');
    console.log(`Year: ${year}, Month: ${month || 'All'}, UserID: ${req.user?._id}`);

    const warden = await Warden.findById(req.user._id);
    if (!warden) {
      console.log('Error: Warden not found for ID:', req.user._id);
      return res.status(404).json({ message: 'Warden record not found' });
    }
    console.log(`Warden found: ${warden.name}, Hostel: ${warden.hostelName}`);

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

    console.log(`Query Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get student IDs for this hostel to filter PL logs
    const studentsInHostel = await Student.find({ hostelName: warden.hostelName }).select('_id');
    const studentIds = studentsInHostel.map(s => s._id);
    console.log(`Found ${studentIds.length} students in hostel: ${studentIds.length}`);

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
      console.log(`Success: Found ${plLogs.length} PL logs`);
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
      console.log(`Success: Found ${outpassLogs.length} Outpass logs`);
    } catch (opErr) {
      console.error('Outpass.find failed:', opErr.message);
      // Don't throw
    }

    // 3. Format and Combine
    const reportData = [];

    // Process PL Logs
    plLogs.forEach((log) => {
      try {
        const entryTime = log.entryTime || null;
        const exitTime = log.exitTime || null;
        const roomNo = (log.studentId && log.studentId.roomNo) ? log.studentId.roomNo : 'N/A';
        const department = (log.studentId && log.studentId.department) ? log.studentId.department : 'N/A';
        const reason = (log.permissionLetterId && log.permissionLetterId.reasonOfVisit) ? log.permissionLetterId.reasonOfVisit : 'N/A';
        const place = (log.permissionLetterId && log.permissionLetterId.placeOfVisit) ? log.permissionLetterId.placeOfVisit : 'N/A';
        const status = entryTime ? 'Completed' : (exitTime ? 'Still Out' : 'Pending');

        reportData.push({
          _id: log._id,
          type: 'PL (Vacation)',
          studentName: log.studentName || 'N/A',
          regNo: log.regNo || 'N/A',
          roomNo,
          department,
          reason,
          place,
          outTime: exitTime,
          inTime: entryTime,
          status,
          processedBy: (log.loggedBy && log.loggedBy.name) ? log.loggedBy.name : 'Warden'
        });
      } catch (err) {
        console.error(`Error processing PL log ${log._id}:`, err);
      }
    });

    // Process Outpass Logs
    outpassLogs.forEach((op) => {
      try {
        const exitTime = op.exitTime || null;
        const inTime = op.actualReturnTime || null;
        const roomNo = op.roomNo || (op.studentId && op.studentId.roomNo) || 'N/A';
        const department = op.department || (op.studentId && op.studentId.department) || 'N/A';
        const status = inTime ? 'Completed' : (exitTime ? 'Still Out' : 'Approved');

        reportData.push({
          _id: op._id,
          type: 'Outpass',
          studentName: op.name || 'N/A',
          regNo: op.regNo || 'N/A',
          roomNo,
          department,
          reason: 'Short Visit',
          place: op.placeOfVisit || 'N/A',
          outTime: exitTime,
          inTime,
          status,
          processedBy: (op.entryApprovedBy && op.entryApprovedBy.name)
            ? op.entryApprovedBy.name
            : (op.exitApprovedBy && op.exitApprovedBy.name)
              ? op.exitApprovedBy.name
              : 'Warden'
        });
      } catch (err) {
        console.error(`Error processing Outpass log ${op._id}:`, err);
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
};;