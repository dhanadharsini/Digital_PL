import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';
import PermissionLetter from '../models/PermissionLetter.js';

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
        parentName: !parentName
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({ $or: [{ email: email.toLowerCase() }, { regNo }] });
    if (studentExists) {
      console.log('Student already exists:', { email: email.toLowerCase(), regNo });
      return res.status(400).json({ message: 'Student already exists with this email or registration number' });
    }

    console.log('Creating student with data:', { regNo, name, email: email.toLowerCase(), mobileNo, yearOfStudy });

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
      parentName
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

    await Student.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    await Parent.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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