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
    console.log('=== ATTEMPTING TO SEND EMAIL ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('From:', process.env.EMAIL_USER || 'dhanadharsinis@gmail.com');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'dhanadharsinis@gmail.com',
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return info;
  } catch (error) {
    console.error('✗ Error sending email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

export default transporter;