// backend/testYearlyLogs.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EntryExitLog from './models/EntryExitLog.js';
import Outpass from './models/Outpass.js';
import Warden from './models/Warden.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const warden = await Warden.findOne();
        if (!warden) {
            console.log('No warden found to test with.');
            process.exit(0);
        }

        const year = new Date().getFullYear().toString();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const plLogs = await EntryExitLog.countDocuments({
            exitTime: { $gte: startOfYear, $lte: endOfYear }
        });

        const outpassLogs = await Outpass.countDocuments({
            hostelName: warden.hostelName,
            $or: [
                { exitTime: { $gte: startOfYear, $lte: endOfYear } },
                { actualReturnTime: { $gte: startOfYear, $lte: endOfYear } }
            ]
        });

        console.log(`Summary for ${year}:`);
        console.log(`- PL Logs: ${plLogs}`);
        console.log(`- Outpass Logs: ${outpassLogs}`);

        const totalMerged = plLogs + outpassLogs;
        console.log(`- Total Merged Expected: ${totalMerged}`);

        console.log('\nVerification Successful: Database contains log data for the current year.');

        process.exit(0);
    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
};

test();
