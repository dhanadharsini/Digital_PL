import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
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
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Add aliases for backwards compatibility
export const authenticateToken = protect;
export const authorizeRole = authorize;