import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';
import { sendEmail } from '../config/email.js';
import { forgotPasswordEmail } from '../utils/emailTemplates.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('Login attempt:', { email, role });

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    let user;
    let Model;

    switch (role) {
      case 'admin':
        Model = User;
        break;
      case 'student':
        Model = Student;
        break;
      case 'parent':
        Model = Parent;
        break;
      case 'warden':
        Model = Warden;
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    user = await Model.findOne({ email: email.toLowerCase() });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - User not found' });
    }

    const isPasswordMatch = await user.matchPassword(password);

    let isTempPasswordValid = false;
    if (user.resetToken && user.resetTokenExpiry) {
      const now = new Date();
      if (user.resetTokenExpiry > now && user.resetToken === password) {
        isTempPasswordValid = true;
      }
    }

    console.log('Password match:', isPasswordMatch);
    console.log('Temp password valid:', isTempPasswordValid);

    if (!isPasswordMatch && !isTempPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
    }

    if (isTempPasswordValid) {
      await Model.updateOne(
        { _id: user._id },
        { $set: { resetToken: null, resetTokenExpiry: null } }
      );
      console.log('Temporary password cleared after login');
    }

    const token = generateToken(user._id, role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || 'Admin',
        email: user.email,
        role
      },
      isTempPassword: isTempPasswordValid
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Email:', email);

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized Email:', normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    console.log('User found in Admin:', user ? 'Yes' : 'No');
    
    if (!user) {
      user = await Student.findOne({ email: normalizedEmail });
      console.log('User found in Student:', user ? 'Yes' : 'No');
    }
    if (!user) {
      user = await Parent.findOne({ email: normalizedEmail });
      console.log('User found in Parent:', user ? 'Yes' : 'No');
    }
    if (!user) {
      user = await Warden.findOne({ email: normalizedEmail });
      console.log('User found in Warden:', user ? 'Yes' : 'No');
    }

    if (!user) {
      console.log('No user found with email:', normalizedEmail);
      return res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    console.log('Generating reset token for user:', user.name || user.email);

    const tempPassword = await user.generateResetToken();
    
    await user.constructor.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: tempPassword,
          resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    );
    console.log('Reset token generated and saved');
    console.log('Temp password:', tempPassword);

    try {
      console.log('Sending email to:', normalizedEmail);
      const emailHtml = forgotPasswordEmail(normalizedEmail, tempPassword);
      
      console.log('Calling sendEmail function...');
      const emailResult = await sendEmail(
        normalizedEmail,
        'Password Reset - Hostel Management System',
        emailHtml
      );
      
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', emailResult.messageId);

      res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    } catch (emailError) {
      console.error('✗ Email sending failed:');
      console.error('Error:', emailError.message);
      res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, temporary password, and new password' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = await Student.findOne({ email: email.toLowerCase() });
    }
    if (!user) {
      user = await Parent.findOne({ email: email.toLowerCase() });
    }
    if (!user) {
      user = await Warden.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetToken !== tempPassword) {
      return res.status(400).json({ message: 'Invalid temporary password' });
    }

    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Password reset token has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password updated successfully. Please login with your new password.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    console.log('\n=== CHANGE PASSWORD REQUEST ===');
    console.log('User ID:', userId);
    console.log('Has currentPassword:', !!currentPassword);
    console.log('Has newPassword:', !!newPassword);

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = null;
    let Model = null;

    user = await User.findById(userId);
    if (user) {
      Model = User;
      console.log('User found in Admin model');
    }
    
    if (!user) {
      user = await Student.findById(userId);
      if (user) {
        Model = Student;
        console.log('User found in Student model');
      }
    }
    
    if (!user) {
      user = await Parent.findById(userId);
      if (user) {
        Model = Parent;
        console.log('User found in Parent model');
      }
    }
    
    if (!user) {
      user = await Warden.findById(userId);
      if (user) {
        Model = Warden;
        console.log('User found in Warden model');
      }
    }

    if (!user || !Model) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.name || user.email);
    console.log('User has resetToken:', !!user.resetToken);

    // SIMPLE LOGIC: If user has a resetToken, they just logged in with temp password
    // In that case, skip current password verification
    const skipPasswordVerification = !!user.resetToken;

    if (!skipPasswordVerification) {
      console.log('Verifying current password...');
      
      if (!currentPassword) {
        console.log('ERROR: Current password not provided');
        return res.status(400).json({ message: 'Current password is required' });
      }

      const isPasswordMatch = await user.matchPassword(currentPassword);
      if (!isPasswordMatch) {
        console.log('ERROR: Current password incorrect');
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      console.log('SUCCESS: Current password verified');
    } else {
      console.log('Temp password detected - skipping current password verification');
    }

    console.log('Hashing new password...');
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    console.log('Password hashed successfully');

    console.log('Updating password in database...');
    const result = await Model.updateOne(
      { _id: userId },
      { 
        $set: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    );

    console.log('Update successful. Modified:', result.modifiedCount);
    console.log('=== CHANGE PASSWORD SUCCESS ===\n');

    return res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('\n=== CHANGE PASSWORD ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('===\n');
    return res.status(500).json({ 
      message: 'Failed to change password', 
      error: error.message 
    });
  }
};
