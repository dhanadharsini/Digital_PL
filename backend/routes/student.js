import express from 'express';
import {
    requestOutpass,
  getOutpassHistory,
  getActiveOutpass,
  getStats,
  getStudentDetails,
  requestPL,
  getPLRequests,
  getPLCard,
  getProfile
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create student authorization middleware
const studentAuth = authorize('student');

// Apply middleware to routes
router.get('/stats', protect, studentAuth, getStats);
router.get('/details', protect, studentAuth, getStudentDetails);
router.post('/request-pl', protect, studentAuth, requestPL);
router.get('/pl-requests', protect, studentAuth, getPLRequests);
router.get('/pl-card/:id', protect, studentAuth, getPLCard);
router.post('/outpass/request', protect, studentAuth, requestOutpass);
router.get('/outpass/history', protect, studentAuth, getOutpassHistory);
router.get('/outpass/active', protect, studentAuth, getActiveOutpass);
router.get('/profile', protect, studentAuth, getProfile);

export default router;