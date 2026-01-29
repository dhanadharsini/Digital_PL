import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import PermissionLetter from '../models/PermissionLetter.js';
import { sendEmail } from '../config/email.js';
import { 
  plApprovedByParentEmail, 
  plRejectedByParentEmail 
} from '../utils/emailTemplates.js';

export const getStats = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user._id);
    
    const pendingRequests = await PermissionLetter.countDocuments({ 
      regNo: parent.studentRegNo,
      parentStatus: 'pending'
    });
    
    const approvedRequests = await PermissionLetter.countDocuments({ 
      regNo: parent.studentRegNo,
      parentStatus: 'approved'
    });
    
    const rejectedRequests = await PermissionLetter.countDocuments({ 
      regNo: parent.studentRegNo,
      parentStatus: 'rejected'
    });

    res.json({
      pendingRequests,
      approvedRequests,
      rejectedRequests
    });
  } catch (error) {
    console.error('Parent getStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user._id);

    const requests = await PermissionLetter.find({
      regNo: parent.studentRegNo,
      parentStatus: 'pending',
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Parent getPendingRequests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveRequest = async (req, res) => {
  console.log('\n========================================');
  console.log('PARENT APPROVE REQUEST - START');
  console.log('========================================');
  
  try {
    console.log('Step 1: Extracting request data...');
    console.log('  - User ID from token:', req.user?._id);
    console.log('  - PL ID from params:', req.params?.id);
    
    if (!req.user || !req.user._id) {
      console.log('❌ ERROR: No user in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.params || !req.params.id) {
      console.log('❌ ERROR: No PL ID provided');
      return res.status(400).json({ message: 'Permission letter ID is required' });
    }

    console.log('\nStep 2: Finding parent record...');
    const parent = await Parent.findById(req.user._id);
    
    if (!parent) {
      console.log('❌ ERROR: Parent not found in database');
      return res.status(404).json({ message: 'Parent record not found' });
    }
    
    console.log('✓ Parent found:');
    console.log('  - Name:', parent.name);
    console.log('  - Email:', parent.email);
    console.log('  - Student Reg No:', parent.studentRegNo);
    
    console.log('\nStep 3: Finding permission letter...');
    const pl = await PermissionLetter.findById(req.params.id);
    
    if (!pl) {
      console.log('❌ ERROR: Permission letter not found');
      return res.status(404).json({ message: 'Permission letter not found' });
    }
    
    console.log('✓ Permission letter found:');
    console.log('  - ID:', pl._id);
    console.log('  - Student Name:', pl.name);
    console.log('  - Student Reg No:', pl.regNo);
    console.log('  - Current Status:', pl.status);
    console.log('  - Parent Status:', pl.parentStatus);
    console.log('  - Warden Status:', pl.wardenStatus);

    console.log('\nStep 4: Checking authorization...');
    console.log('  - PL Reg No:', pl.regNo);
    console.log('  - Parent Student Reg No:', parent.studentRegNo);
    console.log('  - Match?', pl.regNo === parent.studentRegNo);
    
    if (pl.regNo !== parent.studentRegNo) {
      console.log('❌ ERROR: Registration number mismatch - not authorized');
      return res.status(403).json({ 
        message: 'Not authorized to approve this request',
        details: 'Student registration number does not match'
      });
    }
    
    console.log('✓ Authorization check passed');

    console.log('\nStep 5: Checking if already processed...');
    if (pl.parentStatus !== 'pending') {
      console.log('❌ ERROR: Already processed');
      console.log('  - Current parent status:', pl.parentStatus);
      return res.status(400).json({ 
        message: 'Request already processed',
        currentStatus: pl.parentStatus
      });
    }
    
    console.log('✓ Status is pending - can proceed');

    console.log('\nStep 6: Updating permission letter...');
    console.log('  - Setting parentStatus to: approved');
    console.log('  - Setting status to: parent-approved');
    
    pl.parentStatus = 'approved';
    pl.status = 'parent-approved';
    
    console.log('  - Saving to database...');
    await pl.save();
    console.log('✓ Permission letter updated successfully');

    console.log('\nStep 7: Finding student for email...');
    const student = await Student.findOne({ regNo: pl.regNo });
    
    if (student) {
      console.log('✓ Student found:', student.name, '-', student.email);
      
      console.log('\nStep 8: Attempting to send email...');
      try {
        const emailHtml = plApprovedByParentEmail(student.name, {
          placeOfVisit: pl.placeOfVisit,
          departureDateTime: pl.departureDateTime,
          arrivalDateTime: pl.arrivalDateTime
        });
        
        await sendEmail(
          student.email,
          'Permission Approved by Parent',
          emailHtml
        );
        console.log('✓ Email sent successfully');
      } catch (emailError) {
        console.log('⚠️  Email failed (non-critical):');
        console.log('  - Error:', emailError.message);
        console.log('  - Continuing anyway...');
      }
    } else {
      console.log('⚠️  Student not found - skipping email');
    }

    console.log('\nStep 9: Sending success response...');
    const response = {
      message: 'Request approved successfully',
      permissionLetter: {
        id: pl._id,
        status: pl.status,
        parentStatus: pl.parentStatus,
        studentName: pl.name
      }
    };
    
    console.log('✓ Response prepared');
    console.log('========================================');
    console.log('PARENT APPROVE REQUEST - SUCCESS');
    console.log('========================================\n');
    
    return res.json(response);
    
  } catch (error) {
    console.log('\n❌❌❌ FATAL ERROR ❌❌❌');
    console.log('Error Type:', error.name);
    console.log('Error Message:', error.message);
    console.log('Error Stack:', error.stack);
    console.log('========================================\n');
    
    return res.status(500).json({ 
      message: 'Failed to approve request',
      error: error.message,
      details: 'Check server console for detailed logs'
    });
  }
};

export const rejectRequest = async (req, res) => {
  console.log('\n========================================');
  console.log('PARENT REJECT REQUEST - START');
  console.log('========================================');
  
  try {
    const { reason } = req.body;
    console.log('Rejection reason:', reason);
    
    const parent = await Parent.findById(req.user._id);
    if (!parent) {
      console.log('❌ Parent not found');
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    const pl = await PermissionLetter.findById(req.params.id);
    if (!pl) {
      console.log('❌ Permission letter not found');
      return res.status(404).json({ message: 'Permission letter not found' });
    }

    if (pl.regNo !== parent.studentRegNo) {
      console.log('❌ Not authorized');
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (pl.parentStatus !== 'pending') {
      console.log('❌ Already processed');
      return res.status(400).json({ message: 'Request already processed' });
    }

    pl.parentStatus = 'rejected';
    pl.status = 'rejected';
    pl.rejectionReason = reason || 'Rejected by parent';
    await pl.save();
    
    console.log('✓ Request rejected successfully');

    const student = await Student.findOne({ regNo: pl.regNo });
    if (student) {
      try {
        const emailHtml = plRejectedByParentEmail(student.name, {
          placeOfVisit: pl.placeOfVisit,
          departureDateTime: pl.departureDateTime,
          arrivalDateTime: pl.arrivalDateTime
        }, reason);
        
        await sendEmail(
          student.email,
          'Permission Rejected by Parent',
          emailHtml
        );
        console.log('✓ Email sent');
      } catch (emailError) {
        console.log('⚠️  Email failed (non-critical)');
      }
    }

    console.log('========================================\n');
    res.json({ 
      message: 'Request rejected successfully',
      permissionLetter: pl 
    });
  } catch (error) {
    console.log('❌ Reject Error:', error.message);
    console.log('========================================\n');
    res.status(500).json({ message: 'Failed to reject: ' + error.message });
  }
};

export const getRequestHistory = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user._id);

    const requests = await PermissionLetter.find({
      regNo: parent.studentRegNo
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Parent getRequestHistory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};