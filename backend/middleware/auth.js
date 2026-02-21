import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user based on role
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await User.findById(decoded.id).select('-password');
        break;
      case 'student':
        user = await Student.findById(decoded.id).select('-password');
        break;
      case 'parent':
        user = await Parent.findById(decoded.id).select('-password');
        break;
      case 'warden':
        user = await Warden.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { ...user.toObject(), role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const authorize = (role) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== role) {
        return res.status(403).json({ message: `Access denied. ${role} only.` });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Add aliases for backwards compatibility
export const authenticateToken = protect;
export const authorizeRole = adminOnly;