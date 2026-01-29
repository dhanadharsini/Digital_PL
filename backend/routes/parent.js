// Add this temporary test endpoint to backend/routes/parent.js
// This will help us verify the parent record exists

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

router.use(protect);
router.use(authorize('parent'));

router.get('/stats', getStats);
router.get('/pending-requests', getPendingRequests);
router.post('/approve-request/:id', approveRequest);
router.post('/reject-request/:id', rejectRequest);
router.get('/request-history', getRequestHistory);

// ===== TEMPORARY DEBUG ENDPOINT =====
router.get('/debug-info', async (req, res) => {
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