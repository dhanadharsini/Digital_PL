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

    if (!isPasswordMatch && !isTempPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
    }

    if (isTempPasswordValid) {
      // DO NOT clear the resetToken here - keep it so changePassword knows it's a temp login
      // resetToken will be cleared when user changes password
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      user = await Student.findOne({ email: normalizedEmail });
    }
    if (!user) {
      user = await Parent.findOne({ email: normalizedEmail });
    }
    if (!user) {
      user = await Warden.findOne({ email: normalizedEmail });
    }

    if (!user) {
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

    try {
      const emailHtml = forgotPasswordEmail(normalizedEmail, tempPassword);
      
      await sendEmail(
        normalizedEmail,
        'Password Reset - Hostel Management System',
        emailHtml
      );

      res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    } catch (emailError) {
      res.json({ 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }
  } catch (error) {
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
    }
    
    if (!user) {
      user = await Student.findById(userId);
      if (user) {
        Model = Student;
      }
    }
    
    if (!user) {
      user = await Parent.findById(userId);
      if (user) {
        Model = Parent;
      }
    }
    
    if (!user) {
      user = await Warden.findById(userId);
      if (user) {
        Model = Warden;
      }
    }

    if (!user || !Model) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SIMPLE LOGIC: If user has a resetToken, they just logged in with temp password
    // In that case, skip current password verification
    const skipPasswordVerification = !!user.resetToken;

    if (!skipPasswordVerification) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      const isPasswordMatch = await user.matchPassword(currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

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

    return res.json({ message: 'Password changed successfully' });

  } catch (error) {
    return res.status(500).json({ 
      message: 'Failed to change password', 
      error: error.message 
    });
  }
};
