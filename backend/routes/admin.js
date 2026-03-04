import express from 'express';
import {
  getStats,
  addStudent,
  addParent,
  addWarden,
  getAllStudents,
  getAllParents,
  getAllWardens,
  deleteStudent,
  deleteParent,
  deleteWarden,
  uploadStudentProfilePhoto,
  updateStudent,
  updateParent,
  updateWarden
} from '../controllers/adminController.js';
import { uploadProfilePhoto } from '../config/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create admin authorization middleware
const adminAuth = authorize('admin');

// Stats endpoint
router.get('/stats', protect, adminAuth, getStats);

// Add new users
router.post('/add-student', protect, adminAuth, uploadProfilePhoto.single('profilePhoto'), addStudent);
router.post('/add-parent', protect, adminAuth, addParent);
router.post('/add-warden', protect, adminAuth, addWarden);

// Get all users
router.get('/students', protect, adminAuth, getAllStudents);
router.get('/parents', protect, adminAuth, getAllParents);
router.get('/wardens', protect, adminAuth, getAllWardens);

// Delete users
router.delete('/student/:id', protect, adminAuth, deleteStudent);
router.delete('/parent/:id', protect, adminAuth, deleteParent);
router.delete('/warden/:id', protect, adminAuth, deleteWarden);

// Profile photo upload
router.post('/student/:studentId/upload-photo', protect, adminAuth, uploadProfilePhoto.single('profilePhoto'), uploadStudentProfilePhoto);

// Update users
router.put('/student/:id', protect, adminAuth, updateStudent);
router.put('/parent/:id', protect, adminAuth, updateParent);
router.put('/warden/:id', protect, adminAuth, updateWarden);

export default router;