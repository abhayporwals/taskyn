import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  generateAIAssignment,
  getAssignmentsByTrack,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getUserAssignments,
  getAssignmentStats
} from '../controllers/assignment.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Assignment operations (AI-generated only)
router.get('/', getUserAssignments);
router.get('/stats', getAssignmentStats);
router.get('/:assignmentId', getAssignmentById);
router.patch('/:assignmentId', updateAssignment);
router.delete('/:assignmentId', deleteAssignment);

// Assignment submission
router.post('/:assignmentId/submit', submitAssignment);

// Track-specific assignments
router.post('/track/:trackId', generateAIAssignment); // Generate AI assignment for a track
router.get('/track/:trackId', getAssignmentsByTrack);

export default router;
