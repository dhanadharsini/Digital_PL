import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const checkStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all students with their emails
    const students = await Student.find().select('name regNo email');
    console.log('Students in database:');
    students.forEach(student => {
      console.log(`- ${student.name} (${student.regNo}): ${student.email}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkStudents();