
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Warden from './models/Warden.js';

dotenv.config();

const getToken = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const warden = await Warden.findOne();
        if (!warden) {
            console.log('No warden found');
            process.exit(1);
        }

        const token = jwt.sign({ id: warden._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        console.log(token);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

getToken();
