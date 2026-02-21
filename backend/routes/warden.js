import express from 'express';
import { protect, authorize } from '../middleware/auth.js';  // ← CHANGED THIS
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

// Apply authentication and role authorization to all routes
router.use(protect);  // ← CHANGED THIS
router.use(authorize('warden'));  // ← CHANGED THIS

// Dashboard stats
router.get('/stats', getStats);

// Permission Letter Management
router.get('/pending-requests', getPendingRequests);
router.post('/approve/:id', approveRequest);
router.post('/reject/:id', rejectRequest);

// Student Management
router.get('/students', getStudents);

// QR Code Verification
router.post('/verify-qr', verifyQR);
router.post('/log-entry-exit', logEntryExit);

// Outpass Management
router.post('/outpass/verify-qr', verifyOutpassQR);
router.post('/outpass/log-action', logOutpassAction);
router.get('/outpass/delayed', getDelayedStudents);
router.get('/outpass/active', getActiveOutpasses);

// Vacation Delayed Students
router.get('/vacation/delayed', getDelayedVacationStudents);

export default router;