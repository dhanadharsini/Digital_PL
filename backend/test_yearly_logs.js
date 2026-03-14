
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Warden from './models/Warden.js';
import Student from './models/Student.js';
import PermissionLetter from './models/PermissionLetter.js';
import EntryExitLog from './models/EntryExitLog.js';
import Outpass from './models/Outpass.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const year = '2026';
        const warden = await Warden.findOne();
        if (!warden) {
            console.log('No warden found to test with');
            process.exit(1);
        }

        console.log('Testing with warden:', warden.name, 'Hostel:', warden.hostelName);

        const startOfYear = new Date(parseInt(year), 0, 1);
        const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        console.log(`Query Range: ${startOfYear.toISOString()} to ${endOfYear.toISOString()}`);

        const studentsInHostel = await Student.find({ hostelName: warden.hostelName }).select('_id');
        const studentIds = studentsInHostel.map(s => s._id);
        console.log(`Found ${studentIds.length} students in hostel`);

        console.log('Attempting to fetch PL logs...');
        const plLogs = await EntryExitLog.find({
            studentId: { $in: studentIds },
            $or: [
                { exitTime: { $gte: startOfYear, $lte: endOfYear } },
                { entryTime: { $gte: startOfYear, $lte: endOfYear } }
            ]
        }).populate('permissionLetterId')
            .populate('studentId', 'roomNo department')
            .populate('loggedBy', 'name');
        console.log(`Success: Found ${plLogs.length} PL logs`);

        console.log('Attempting to fetch Outpass logs...');
        const outpassLogs = await Outpass.find({
            hostelName: warden.hostelName,
            $or: [
                { exitTime: { $gte: startOfYear, $lte: endOfYear } },
                { actualReturnTime: { $gte: startOfYear, $lte: endOfYear } }
            ]
        }).populate('studentId', 'roomNo department')
            .populate('exitApprovedBy', 'name')
            .populate('entryApprovedBy', 'name');
        console.log(`Success: Found ${outpassLogs.length} Outpass logs`);

        process.exit(0);
    } catch (error) {
        console.error('TEST FAILED:', error);
        process.exit(1);
    }
};

test();
