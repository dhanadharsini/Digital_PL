import jwt from 'jsonwebtoken';
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

    console.log('Login attempt:', { email, role }); // Debug log

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

    console.log('User found:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - User not found' });
    }

    const isPasswordMatch = await user.matchPassword(password);

    // Check if user has a valid reset token that hasn't expired
    let isTempPasswordValid = false;
    if (user.resetToken && user.resetTokenExpiry) {
      const now = new Date();
      if (user.resetTokenExpiry > now && user.resetToken === password) {
        isTempPasswordValid = true;
      }
    }

    console.log('Password match:', isPasswordMatch); // Debug log
    console.log('Temp password valid:', isTempPasswordValid); // Debug log

    if (!isPasswordMatch && !isTempPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
    }

    // If using temporary password, clear it after successful login
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

    // Search across all user types
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
      // Return success anyway to prevent email enumeration
      return res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    console.log('Generating reset token for user:', user.name || user.email);

    // Generate temporary password
    const tempPassword = await user.generateResetToken();
    
    // Use updateOne instead of save to avoid middleware issues
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

    // Send email with temporary password
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
      console.error('Full error:', emailError);
      // Return success anyway to prevent revealing server issues
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

    // Search across all user types
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

    // Verify temporary password
    if (user.resetToken !== tempPassword) {
      return res.status(400).json({ message: 'Invalid temporary password' });
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Password reset token has expired. Please request a new one.' });
    }

    // Update password
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

    console.log('=== CHANGE PASSWORD REQUEST ===');
    console.log('User ID:', userId);

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide new password' });
    }

    // Find user across all models
    let user = await User.findById(userId);
    let Model = User;
    
    if (!user) {
      user = await Student.findById(userId);
      Model = Student;
    }
    if (!user) {
      user = await Parent.findById(userId);
      Model = Parent;
    }
    if (!user) {
      user = await Warden.findById(userId);
      Model = Warden;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.name || user.email);

    // If user has temp password and no current password provided, skip verification
    // Otherwise verify current password
    if (user.resetToken) {
      console.log('User has temp password, skipping current password verification');
    } else {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Please provide current password' });
      }

      const isPasswordMatch = await user.matchPassword(currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      console.log('Current password verified');
    }

    // Update password using updateOne to avoid middleware
    const hashedPassword = await require('bcryptjs').hash(newPassword, 10);
    
    await Model.updateOne(
      { _id: userId },
      { 
        $set: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      }
    );

    console.log('Password updated successfully');
    console.log('=== CHANGE PASSWORD SUCCESS ===');

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};