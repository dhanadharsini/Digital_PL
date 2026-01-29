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

    // Check if student already exists
    const studentExists = await Student.findOne({ $or: [{ email }, { regNo }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists with this email or registration number' });
    }

    const student = await Student.create({
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
    });

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    // Check if parent already exists
    const parentExists = await Parent.findOne({ $or: [{ email }, { parentId }] });
    if (parentExists) {
      return res.status(400).json({ message: 'Parent already exists with this email or parent ID' });
    }

    // Verify student exists
    const student = await Student.findOne({ regNo: studentRegNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found with this registration number' });
    }

    const parent = await Parent.create({
      parentId,
      name,
      email,
      password,
      mobileNo,
      studentName,
      studentRegNo
    });

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    // Check if warden already exists
    const wardenExists = await Warden.findOne({ $or: [{ email }, { wardenId }] });
    if (wardenExists) {
      return res.status(400).json({ message: 'Warden already exists with this email or warden ID' });
    }

    const warden = await Warden.create({
      wardenId,
      name,
      email,
      password,
      mobileNo,
      hostelName
    });

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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