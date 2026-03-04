import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const testProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all students and check their profile photos
    const students = await Student.find().select('name regNo profilePhoto');
    console.log('Students in database:');
    students.forEach(student => {
      console.log(`- ${student.name} (${student.regNo}): ${student.profilePhoto || 'No photo'}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

testProfile();