// Save this as debugDatabase.js in your backend folder
// Run with: node debugDatabase.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Parent from './models/Parent.js';
import Warden from './models/Warden.js';
import PermissionLetter from './models/PermissionLetter.js';

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check Students
    console.log('=== STUDENTS ===');
    const students = await Student.find().select('name regNo email');
    console.log(`Total Students: ${students.length}`);
    students.forEach(s => {
      console.log(`  - ${s.name} (${s.regNo}) - ${s.email}`);
    });
    console.log('');

    // Check Parents
    console.log('=== PARENTS ===');
    const parents = await Parent.find().select('name studentRegNo email');
    console.log(`Total Parents: ${parents.length}`);
    parents.forEach(p => {
      console.log(`  - ${p.name} for student regNo: ${p.studentRegNo} - ${p.email}`);
    });
    console.log('');

    // Check for mismatches
    console.log('=== CHECKING MATCHES ===');
    for (const student of students) {
      const matchingParent = await Parent.findOne({ studentRegNo: student.regNo });
      if (!matchingParent) {
        console.log(`⚠️  NO PARENT FOUND for student: ${student.name} (${student.regNo})`);
      } else {
        console.log(`✓  ${student.name} has parent: ${matchingParent.name}`);
      }
    }
    console.log('');

    // Check Wardens
    console.log('=== WARDENS ===');
    const wardens = await Warden.find().select('name hostelName email');
    console.log(`Total Wardens: ${wardens.length}`);
    wardens.forEach(w => {
      console.log(`  - ${w.name} (${w.hostelName}) - ${w.email}`);
    });
    console.log('');

    // Check Permission Letters
    console.log('=== PERMISSION LETTERS ===');
    const pls = await PermissionLetter.find()
      .select('name regNo status placeOfVisit createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(`Total PLs: ${pls.length}`);
    pls.forEach(pl => {
      console.log(`  - ${pl.name} (${pl.regNo}) - Status: ${pl.status} - ${pl.placeOfVisit} - ${new Date(pl.createdAt).toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debug();