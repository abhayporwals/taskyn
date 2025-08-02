import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  generateAITrack,
  getUserTracks,
  getTrackById,
  updateTrack,
  deleteTrack,
  getTrackProgress,
  archiveTrack,
  reactivateTrack
} from '../controllers/track.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Track operations (AI-generated only)
router.post('/', generateAITrack); // Main endpoint for generating AI tracks
router.get('/', getUserTracks);
router.get('/:trackId', getTrackById);
router.patch('/:trackId', updateTrack);
router.delete('/:trackId', deleteTrack);

// Track progress and status
router.get('/:trackId/progress', getTrackProgress);
router.patch('/:trackId/archive', archiveTrack);
router.patch('/:trackId/reactivate', reactivateTrack);

export default router;
