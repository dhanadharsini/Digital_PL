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
  deleteWarden
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.post('/add-student', addStudent);
router.post('/add-parent', addParent);
router.post('/add-warden', addWarden);
router.get('/students', getAllStudents);
router.get('/parents', getAllParents);
router.get('/wardens', getAllWardens);
router.delete('/student/:id', deleteStudent);
router.delete('/parent/:id', deleteParent);
router.delete('/warden/:id', deleteWarden);

export default router;