import express from 'express';
import {
  getStats,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getRequestHistory
} from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create parent authorization middleware
const parentAuth = authorize('parent');

// Apply middleware to routes
router.get('/stats', protect, parentAuth, getStats);
router.get('/pending-requests', protect, parentAuth, getPendingRequests);
router.post('/approve-request/:id', protect, parentAuth, approveRequest);
router.post('/reject-request/:id', protect, parentAuth, rejectRequest);
router.get('/request-history', protect, parentAuth, getRequestHistory);

// Debug endpoint
router.get('/debug-info', protect, parentAuth, async (req, res) => {
  try {
    const Parent = (await import('../models/Parent.js')).default;
    const PermissionLetter = (await import('../models/PermissionLetter.js')).default;
    
    const parent = await Parent.findById(req.user._id);
    
    if (!parent) {
      return res.json({
        error: 'Parent not found',
        userId: req.user._id
      });
    }
    
    const pendingPLs = await PermissionLetter.find({
      regNo: parent.studentRegNo,
      parentStatus: 'pending'
    });
    
    res.json({
      parent: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        studentRegNo: parent.studentRegNo
      },
      pendingPLs: pendingPLs.map(pl => ({
        id: pl._id,
        studentName: pl.name,
        regNo: pl.regNo,
        status: pl.status,
        parentStatus: pl.parentStatus,
        match: pl.regNo === parent.studentRegNo
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;