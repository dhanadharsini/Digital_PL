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

// Protect all routes and authorize only student
router.use(protect);
router.use(authorize('student'));

router.get('/stats', getStats);
router.get('/details', getStudentDetails);
router.post('/request-pl', requestPL);
router.get('/pl-requests', getPLRequests);
router.get('/pl-card/:id', getPLCard);
router.post('/outpass/request', requestOutpass);
router.get('/outpass/history', getOutpassHistory);
router.get('/outpass/active', getActiveOutpass);
router.get('/profile', getProfile);

export default router;