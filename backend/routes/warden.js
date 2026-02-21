import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStats,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getStudents,
  verifyQR,
  logEntryExit,
  verifyOutpassQR,
  logOutpassAction,
  getDelayedStudents,
  getActiveOutpasses,
  getDelayedVacationStudents
} from '../controllers/wardenController.js';

const router = express.Router();

// Create warden authorization middleware
const wardenAuth = authorize('warden');

// Dashboard stats
router.get('/stats', protect, wardenAuth, getStats);

// Permission Letter Management
router.get('/pending-requests', protect, wardenAuth, getPendingRequests);
router.post('/approve/:id', protect, wardenAuth, approveRequest);
router.post('/reject/:id', protect, wardenAuth, rejectRequest);

// Student Management
router.get('/students', protect, wardenAuth, getStudents);

// QR Code Verification
router.post('/verify-qr', protect, wardenAuth, verifyQR);
router.post('/log-entry-exit', protect, wardenAuth, logEntryExit);

// Outpass Management
router.post('/outpass/verify-qr', protect, wardenAuth, verifyOutpassQR);
router.post('/outpass/log-action', protect, wardenAuth, logOutpassAction);
router.get('/outpass/delayed', protect, wardenAuth, getDelayedStudents);
router.get('/outpass/active', protect, wardenAuth, getActiveOutpasses);

// Vacation Delayed Students
router.get('/vacation/delayed', protect, wardenAuth, getDelayedVacationStudents);

export default router;