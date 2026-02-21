import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import PermissionLetter from '../models/PermissionLetter.js';
import EntryExitLog from '../models/EntryExitLog.js';
import { sendEmail } from '../config/email.js';
import { plRequestToParentEmail } from '../utils/emailTemplates.js';
import Outpass from '../models/Outpass.js';
import { generateQRCode } from '../utils/generateQR.js';

// Update getStats function in backend/controllers/studentController.js

export const getStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const pendingRequests = await PermissionLetter.countDocuments({ 
      studentId, 
      status: 'pending' 
    });
    
    const approvedRequests = await PermissionLetter.countDocuments({ 
      studentId, 
      status: 'approved' 
    });
    
    const rejectedRequests = await PermissionLetter.countDocuments({ 
      studentId, 
      status: 'rejected' 
    });

    // Get student to check if on vacation
    const student = await Student.findById(studentId);

    let currentVacation = null;

    // Only show vacation if student is actually on vacation (has logged exit)
    if (student && student.isOnVacation) {
      // Find the active PL with logged exit
      const activePL = await PermissionLetter.findOne({
        studentId,
        status: 'approved'
      }).sort({ createdAt: -1 });

      if (activePL) {
        // Check if exit is logged
        const exitLog = await EntryExitLog.findOne({
          permissionLetterId: activePL._id,
          exitTime: { $ne: null },
          entryTime: null  // Not yet returned
        });

        if (exitLog) {
          currentVacation = {
            placeOfVisit: activePL.placeOfVisit,
            arrivalDateTime: activePL.arrivalDateTime,
            exitTime: exitLog.exitTime,
            isOnVacation: true
          };
        }
      }
    }

    res.json({
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      currentVacation
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get Student Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestPL = async (req, res) => {
  try {
    const studentId = req.user._id;
    const {
      name,
      roomNo,
      hostelName,
      yearOfStudy,
      department,
      regNo,
      placeOfVisit,
      reasonOfVisit,
      departureDateTime,
      arrivalDateTime
    } = req.body;

    console.log('Request PL - Student ID:', studentId);
    console.log('Request PL - Reg No:', regNo);

    // Check if student has any pending requests
    const pendingRequest = await PermissionLetter.findOne({
      studentId,
      status: { $in: ['pending', 'parent-approved'] }
    });

    if (pendingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending permission letter request' 
      });
    }

    // Check for active (non-expired) approved requests
    const currentDateTime = new Date();
    const activeApprovedRequest = await PermissionLetter.findOne({
      studentId,
      status: 'approved',
      arrivalDateTime: { $gt: currentDateTime } // Arrival time is still in the future
    });

    if (activeApprovedRequest) {
      // Check if it's fully used (student has completed the entry)
      const entryLog = await EntryExitLog.findOne({
        permissionLetterId: activeApprovedRequest._id,
        entryTime: { $ne: null } // Entry has been logged
      });

      if (!entryLog) {
        // PL is still active (not expired and not fully used)
        return res.status(400).json({ 
          message: 'You already have an active approved permission letter. Please wait until it expires or is completed before requesting a new one.' 
        });
      }
    }

    // Create permission letter
    const permissionLetter = await PermissionLetter.create({
      studentId,
      name,
      roomNo,
      hostelName,
      yearOfStudy,
      department,
      regNo,
      placeOfVisit,
      reasonOfVisit,
      departureDateTime,
      arrivalDateTime
    });

    // Find parent
    const parent = await Parent.findOne({ studentRegNo: regNo });
    
    if (parent) {
      // TRY to send email - but don't fail if it doesn't work
      try {
        const emailHtml = plRequestToParentEmail(name, {
          placeOfVisit,
          reasonOfVisit,
          departureDateTime,
          arrivalDateTime
        });
        
        await sendEmail(
          parent.email,
          'Permission Letter Request from Your Child',
          emailHtml
        );
        console.log('Email sent to parent successfully');
      } catch (emailError) {
        console.error('Email sending failed (non-critical):', emailError.message);
        // Continue anyway - email is not critical
      }
    } else {
      console.warn(`⚠️ No parent found for student regNo: ${regNo}`);
      console.log('PL created but no email sent (no parent record)');
    }

    res.status(201).json({
      message: 'Permission letter request sent successfully',
      permissionLetter
    });
  } catch (error) {
    console.error('❌ Request PL Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getPLRequests = async (req, res) => {
  try {
    const studentId = req.user._id;

    const requests = await PermissionLetter.find({ studentId })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get PL Requests Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPLCard = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const pl = await PermissionLetter.findOne({ 
      _id: id, 
      studentId
    });

    if (!pl) {
      return res.status(404).json({ message: 'Permission letter not found' });
    }

    // Check if PL is expired or fully used
    if (pl.status === 'expired' || pl.isFullyUsed) {
      return res.status(403).json({ 
        message: 'This permission letter has expired and cannot be viewed' 
      });
    }

    // Check if PL is approved
    if (pl.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Permission letter is not approved yet' 
      });
    }

    res.json(pl);
  } catch (error) {
    console.error('Get PL Card Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestOutpass = async (req, res) => {
  try {
    const { placeOfVisit } = req.body;
    const studentId = req.user._id;

    if (!placeOfVisit) {
      return res.status(400).json({ message: 'Place of visit is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const activeOutpass = await Outpass.findOne({
      studentId,
      status: 'active'
    });

    if (activeOutpass) {
      return res.status(400).json({ 
        message: 'You already have an active outpass. Please complete it before requesting a new one.' 
      });
    }

    const outpassData = {
      studentId: student._id.toString(),
      regNo: student.regNo,
      name: student.name,
      department: student.department,
      yearOfStudy: student.yearOfStudy,
      roomNo: student.roomNo,
      hostelName: student.hostelName,
      placeOfVisit,
      type: 'outpass',
      createdAt: new Date().toISOString()
    };

    const qrCode = await generateQRCode(outpassData);

    const outpass = await Outpass.create({
      studentId: student._id,
      name: student.name,
      regNo: student.regNo,
      department: student.department,
      yearOfStudy: student.yearOfStudy,
      roomNo: student.roomNo,
      hostelName: student.hostelName,
      placeOfVisit,
      qrCode,
      status: 'active'
    });

    res.status(201).json({
      message: 'Outpass created successfully',
      outpass
    });
  } catch (error) {
    console.error('Request Outpass Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOutpassHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    const outpasses = await Outpass.find({ studentId })
      .sort({ createdAt: -1 });

    res.json(outpasses);
  } catch (error) {
    console.error('Get Outpass History Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActiveOutpass = async (req, res) => {
  try {
    const studentId = req.user._id;

    const outpass = await Outpass.findOne({
      studentId,
      status: 'active'
    });

    if (!outpass) {
      return res.status(404).json({ message: 'No active outpass found' });
    }

    res.json(outpass);
  } catch (error) {
    console.error('Get Active Outpass Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const student = await Student.findById(studentId).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};