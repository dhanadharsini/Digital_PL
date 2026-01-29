import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Warden from '../models/Warden.js';

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

    console.log('Password match:', isPasswordMatch); // Debug log

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
    }

    const token = generateToken(user._id, role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || 'Admin',
        email: user.email,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};