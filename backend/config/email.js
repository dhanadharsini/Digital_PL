import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'dhanadharsinis@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'pjwfivadlzfl lzkg'
  }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Email transporter verification failed:', error.message);
  } else {
    console.log('✓ Email transporter is ready to send emails');
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dhanadharsinis@gmail.com',
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

export default transporter;