import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';
import PermissionLetter from '../models/PermissionLetter.js';
import Outpass from '../models/Outpass.js';
import EntryExitLog from '../models/EntryExitLog.js';
import User from '../models/User.js';
import { uploadProfilePhoto } from '../config/upload.js';
import path from 'path';

export const getStats = async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const parents = await Parent.countDocuments();
    const wardens = await Warden.countDocuments();
    const pendingRequests = await PermissionLetter.countDocuments({ 
      status: { $in: ['pending', 'parent-approved'] } 
    });

    res.json({
      students,
      parents,
      wardens,
      pendingRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addStudent = async (req, res) => {
  try {
    // Handle profile photo upload
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = `/uploads/profile-pictures/${req.file.filename}`;
    }
    
    // Handle form data - when using multipart/form-data, all fields come as strings
    const {
      regNo,
      name,
      email,
      password,
      mobileNo,
      yearOfStudy,
      department,
      hostelName,
      roomNo,
      parentName
    } = req.body;

    // Validation
    if (!regNo || !name || !email || !password || !mobileNo || !yearOfStudy || !department || !hostelName || !roomNo || !parentName) {
      console.log('Validation failed. Missing fields:', {
        regNo: !regNo,
        name: !name,
        email: !email,
        password: !password,
        mobileNo: !mobileNo,
        yearOfStudy: !yearOfStudy,
        department: !department,
        hostelName: !hostelName,
        roomNo: !roomNo,
        parentName: !parentName,
        body: req.body,
        file: req.file
      });
      return res.status(400).json({ 
        message: 'All fields are required', 
        missing: {
          regNo: !regNo,
          name: !name,
          email: !email,
          password: !password,
          mobileNo: !mobileNo,
          yearOfStudy: !yearOfStudy,
          department: !department,
          hostelName: !hostelName,
          roomNo: !roomNo,
          parentName: !parentName
        }
      });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({ $or: [{ email: email.toLowerCase() }, { regNo }] });
    if (studentExists) {
      console.log('Student already exists:', { email: email.toLowerCase(), regNo });
      return res.status(400).json({ message: 'Student already exists with this email or registration number' });
    }

    console.log('Creating student with data:', { 
      regNo, 
      name, 
      email: email.toLowerCase(), 
      mobileNo, 
      yearOfStudy,
      bodyKeys: Object.keys(req.body),
      hasFile: !!req.file
    });

    const student = await Student.create({
      regNo,
      name,
      email: email.toLowerCase(),
      password,
      mobileNo,
      yearOfStudy,
      department,
      hostelName,
      roomNo,
      parentName,
      profilePhoto: profilePhotoPath
    });

    console.log('Student created successfully:', student._id);

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        regNo: student.regNo,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error('ERROR in addStudent:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

export const addParent = async (req, res) => {
  try {
    const {
      parentId,
      name,
      email,
      password,
      mobileNo,
      studentName,
      studentRegNo
    } = req.body;

    // Validation
    if (!parentId || !name || !email || !password || !mobileNo || !studentRegNo) {
      console.log('Parent validation failed. Missing fields:', {
        parentId: !parentId,
        name: !name,
        email: !email,
        password: !password,
        mobileNo: !mobileNo,
        studentRegNo: !studentRegNo
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if parent already exists
    const parentExists = await Parent.findOne({ $or: [{ email: email.toLowerCase() }, { parentId }] });
    if (parentExists) {
      console.log('Parent already exists:', { email: email.toLowerCase(), parentId });
      return res.status(400).json({ message: 'Parent already exists with this email or parent ID' });
    }

    // Verify student exists
    const student = await Student.findOne({ regNo: studentRegNo });
    if (!student) {
      console.log('Student not found with regNo:', studentRegNo);
      return res.status(400).json({ message: 'Student not found with this registration number' });
    }

    console.log('Creating parent for student:', studentRegNo);

    const parent = await Parent.create({
      parentId,
      name,
      email: email.toLowerCase(),
      password,
      mobileNo,
      studentName,
      studentRegNo
    });

    console.log('Parent created successfully:', parent._id);

    res.status(201).json({
      message: 'Parent added successfully',
      parent: {
        id: parent._id,
        parentId: parent.parentId,
        name: parent.name,
        email: parent.email
      }
    });
  } catch (error) {
    console.error('ERROR in addParent:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

export const addWarden = async (req, res) => {
  try {
    const {
      wardenId,
      name,
      email,
      password,
      mobileNo,
      hostelName
    } = req.body;

    // Validation
    if (!wardenId || !name || !email || !password || !mobileNo || !hostelName) {
      console.log('Warden validation failed. Missing fields:', {
        wardenId: !wardenId,
        name: !name,
        email: !email,
        password: !password,
        mobileNo: !mobileNo,
        hostelName: !hostelName
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if warden already exists
    const wardenExists = await Warden.findOne({ $or: [{ email: email.toLowerCase() }, { wardenId }] });
    if (wardenExists) {
      console.log('Warden already exists:', { email: email.toLowerCase(), wardenId });
      return res.status(400).json({ message: 'Warden already exists with this email or warden ID' });
    }

    console.log('Creating warden for hostel:', hostelName);

    const warden = await Warden.create({
      wardenId,
      name,
      email: email.toLowerCase(),
      password,
      mobileNo,
      hostelName
    });

    console.log('Warden created successfully:', warden._id);

    res.status(201).json({
      message: 'Warden added successfully',
      warden: {
        id: warden._id,
        wardenId: warden.wardenId,
        name: warden.name,
        email: warden.email
      }
    });
  } catch (error) {
    console.error('ERROR in addWarden:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().select('-password').sort({ createdAt: -1 });
    res.json(parents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllWardens = async (req, res) => {
  try {
    const wardens = await Warden.find().select('-password').sort({ createdAt: -1 });
    res.json(wardens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentId = req.params.id;
    const regNo = student.regNo;

    console.log(`Deleting student ${student.name} (${regNo}) and all related data...`);

    // Delete all related data in proper order
    
    // 1. Delete EntryExitLogs
    const entryExitLogsDeleted = await EntryExitLog.deleteMany({ studentId });
    console.log(`Deleted ${entryExitLogsDeleted.deletedCount} entry/exit logs`);
    
    // 2. Delete Outpasses
    const outpassesDeleted = await Outpass.deleteMany({ studentId });
    console.log(`Deleted ${outpassesDeleted.deletedCount} outpasses`);
    
    // 3. Delete Permission Letters
    const permissionLettersDeleted = await PermissionLetter.deleteMany({ studentId });
    console.log(`Deleted ${permissionLettersDeleted.deletedCount} permission letters`);
    
    // 4. Delete User document (if exists)
    const userDeleted = await User.findOneAndDelete({ regNo });
    if (userDeleted) {
      console.log(`Deleted user account for ${regNo}`);
    }
    
    // 5. Delete the student
    await Student.findByIdAndDelete(studentId);
    console.log(`Deleted student record for ${student.name}`);

    res.json({ 
      message: 'Student and all related data deleted successfully',
      deletedData: {
        student: student.name,
        regNo: regNo,
        entryExitLogs: entryExitLogsDeleted.deletedCount,
        outpasses: outpassesDeleted.deletedCount,
        permissionLetters: permissionLettersDeleted.deletedCount,
        userAccount: userDeleted ? 'Deleted' : 'Not found'
      }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ 
      message: 'Server error while deleting student and related data',
      error: error.message 
    });
  }
};

export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const parentId = req.params.id;
    const parentName = parent.name;
    const studentRegNo = parent.studentRegNo;

    console.log(`Deleting parent ${parentName} and associated student ${studentRegNo}...`);

    // Find the associated student
    const student = await Student.findOne({ regNo: studentRegNo });
    
    if (!student) {
      // If student doesn't exist, just delete the parent
      await Parent.findByIdAndDelete(parentId);
      console.log(`Deleted parent ${parentName} (no associated student found)`);
      return res.json({ 
        message: 'Parent deleted successfully',
        details: `Parent ${parentName} deleted. No associated student found.`
      });
    }

    const studentId = student._id;
    const studentName = student.name;

    console.log(`Deleting student ${studentName} (${studentRegNo}) and all related data...`);

    // Delete all related data in proper order
    
    // 1. Delete EntryExitLogs
    const entryExitLogsDeleted = await EntryExitLog.deleteMany({ studentId });
    console.log(`Deleted ${entryExitLogsDeleted.deletedCount} entry/exit logs`);
    
    // 2. Delete Outpasses
    const outpassesDeleted = await Outpass.deleteMany({ studentId });
    console.log(`Deleted ${outpassesDeleted.deletedCount} outpasses`);
    
    // 3. Delete Permission Letters
    const permissionLettersDeleted = await PermissionLetter.deleteMany({ studentId });
    console.log(`Deleted ${permissionLettersDeleted.deletedCount} permission letters`);
    
    // 4. Delete User document (if exists)
    const userDeleted = await User.findOneAndDelete({ regNo: studentRegNo });
    if (userDeleted) {
      console.log(`Deleted user account for ${studentRegNo}`);
    }
    
    // 5. Delete the student
    await Student.findByIdAndDelete(studentId);
    console.log(`Deleted student record for ${studentName}`);
    
    // 6. Delete the parent
    await Parent.findByIdAndDelete(parentId);
    console.log(`Deleted parent record for ${parentName}`);

    res.json({ 
      message: 'Parent, student, and all related data deleted successfully',
      deletedData: {
        parent: parentName,
        student: studentName,
        regNo: studentRegNo,
        entryExitLogs: entryExitLogsDeleted.deletedCount,
        outpasses: outpassesDeleted.deletedCount,
        permissionLetters: permissionLettersDeleted.deletedCount,
        userAccount: userDeleted ? 'Deleted' : 'Not found'
      }
    });
  } catch (error) {
    console.error('Error deleting parent and related data:', error);
    res.status(500).json({ 
      message: 'Server error while deleting parent and related data',
      error: error.message 
    });
  }
};

export const deleteWarden = async (req, res) => {
  try {
    const warden = await Warden.findById(req.params.id);
    
    if (!warden) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    await Warden.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Warden deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Endpoint for uploading profile photo for existing student
export const uploadStudentProfilePhoto = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student with profile photo path
    const profilePhotoPath = `/uploads/profile-pictures/${req.file.filename}`;
    student.profilePhoto = profilePhotoPath;
    await student.save();
    
    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: profilePhotoPath
    });
  } catch (error) {
    console.error('ERROR in uploadStudentProfilePhoto:', error.message);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

// Update student details
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { regNo, name, email, mobileNo, yearOfStudy, department, hostelName, roomNo, parentName } = req.body;
    
    // Find the student
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if email or regNo already exists for another student
    const emailConflict = await Student.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id }
    });
    if (emailConflict) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const regNoConflict = await Student.findOne({
      regNo,
      _id: { $ne: id }
    });
    if (regNoConflict) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }
    
    // Update student details
    existingStudent.regNo = regNo;
    existingStudent.name = name;
    existingStudent.email = email.toLowerCase();
    existingStudent.mobileNo = mobileNo;
    existingStudent.yearOfStudy = yearOfStudy;
    existingStudent.department = department;
    existingStudent.hostelName = hostelName;
    existingStudent.roomNo = roomNo;
    existingStudent.parentName = parentName;
    
    await existingStudent.save();
    
    res.json({
      message: 'Student updated successfully',
      student: {
        id: existingStudent._id,
        regNo: existingStudent.regNo,
        name: existingStudent.name,
        email: existingStudent.email,
        mobileNo: existingStudent.mobileNo,
        yearOfStudy: existingStudent.yearOfStudy,
        department: existingStudent.department,
        hostelName: existingStudent.hostelName,
        roomNo: existingStudent.roomNo,
        parentName: existingStudent.parentName,
        profilePhoto: existingStudent.profilePhoto
      }
    });
  } catch (error) {
    console.error('ERROR in updateStudent:', error.message);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

// Update parent details
export const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId, name, email, mobileNo, studentName, studentRegNo } = req.body;
    
    // Find the parent
    const existingParent = await Parent.findById(id);
    if (!existingParent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Check if email or parentId already exists for another parent
    const emailConflict = await Parent.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id }
    });
    if (emailConflict) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const parentIdConflict = await Parent.findOne({
      parentId,
      _id: { $ne: id }
    });
    if (parentIdConflict) {
      return res.status(400).json({ message: 'Parent ID already exists' });
    }
    
    // Verify student exists
    const student = await Student.findOne({ regNo: studentRegNo });
    if (!student) {
      return res.status(400).json({ message: 'Student not found with this registration number' });
    }
    
    // Update parent details
    existingParent.parentId = parentId;
    existingParent.name = name;
    existingParent.email = email.toLowerCase();
    existingParent.mobileNo = mobileNo;
    existingParent.studentName = studentName;
    existingParent.studentRegNo = studentRegNo;
    
    await existingParent.save();
    
    res.json({
      message: 'Parent updated successfully',
      parent: {
        id: existingParent._id,
        parentId: existingParent.parentId,
        name: existingParent.name,
        email: existingParent.email,
        mobileNo: existingParent.mobileNo,
        studentName: existingParent.studentName,
        studentRegNo: existingParent.studentRegNo
      }
    });
  } catch (error) {
    console.error('ERROR in updateParent:', error.message);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};

// Update warden details
export const updateWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const { wardenId, name, email, mobileNo, hostelName } = req.body;
    
    // Find the warden
    const existingWarden = await Warden.findById(id);
    if (!existingWarden) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    
    // Check if email or wardenId already exists for another warden
    const emailConflict = await Warden.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id }
    });
    if (emailConflict) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const wardenIdConflict = await Warden.findOne({
      wardenId,
      _id: { $ne: id }
    });
    if (wardenIdConflict) {
      return res.status(400).json({ message: 'Warden ID already exists' });
    }
    
    // Update warden details
    existingWarden.wardenId = wardenId;
    existingWarden.name = name;
    existingWarden.email = email.toLowerCase();
    existingWarden.mobileNo = mobileNo;
    existingWarden.hostelName = hostelName;
    
    await existingWarden.save();
    
    res.json({
      message: 'Warden updated successfully',
      warden: {
        id: existingWarden._id,
        wardenId: existingWarden.wardenId,
        name: existingWarden.name,
        email: existingWarden.email,
        mobileNo: existingWarden.mobileNo,
        hostelName: existingWarden.hostelName
      }
    });
  } catch (error) {
    console.error('ERROR in updateWarden:', error.message);
    res.status(500).json({ 
      message: error.message || 'Server error',
      error: error.message 
    });
  }
};