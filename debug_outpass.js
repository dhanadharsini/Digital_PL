import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

import Student from './backend/models/Student.js';
import Outpass from './backend/models/Outpass.js';

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const student = await Student.findOne({ name: /anulakshmi/i });
        if (!student) {
            console.log('Student "anulakshmi" not found');
            const allStudents = await Student.find({}).limit(10);
            console.log('Sample students:', allStudents.map(s => s.name));
        } else {
            console.log('Found Student:', student.name, 'ID:', student._id, 'Hostel:', student.hostelName);

            const outpasses = await Outpass.find({ studentId: student._id });
            console.log('Outpasses for student:', outpasses.length);
            outpasses.forEach(op => {
                console.log(`- ID: ${op._id}, Status: ${op.status}, Exit: ${op.exitTime}, Return: ${op.actualReturnTime}, Hostel: ${op.hostelName}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debug();
