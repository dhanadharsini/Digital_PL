import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const checkStudentPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find Dhana Dharsini and check password/reset token
    const student = await Student.findOne({ regNo: '2303717720522010' }).select('name email password resetToken resetTokenExpiry');
    console.log('Student details:');
    console.log(`Name: ${student.name}`);
    console.log(`Email: ${student.email}`);
    console.log(`Has reset token: ${!!student.resetToken}`);
    console.log(`Reset token: ${student.resetToken || 'None'}`);
    console.log(`Reset token expiry: ${student.resetTokenExpiry || 'None'}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkStudentPassword();