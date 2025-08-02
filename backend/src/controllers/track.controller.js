import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAITrackService,
  getUserTracksService,
  getTrackByIdService,
  updateTrackService,
  deleteTrackService,
  getTrackProgressService,
  archiveTrackService,
  reactivateTrackService
} from '../services/track.service.js';

export const generateAITrack = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const options = req.body;

    const track = await generateAITrackService(userId, options);
    
    res.status(201).json(
      new ApiResponse(201, track, 'AI track generated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getUserTracks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const filters = {
      status: req.query.status,
      generatedBy: req.query.generatedBy
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const tracks = await getUserTracksService(userId, filters);
    
    res.status(200).json(
      new ApiResponse(200, tracks, 'Tracks fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getTrackById = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;

    const track = await getTrackByIdService(trackId, userId);
    
    res.status(200).json(
      new ApiResponse(200, track, 'Track fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const updateTrack = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.generatedBy;
    delete updateData.totalTasks;
    delete updateData.completedTasks;

    const track = await updateTrackService(trackId, userId, updateData);
    
    res.status(200).json(
      new ApiResponse(200, track, 'Track updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteTrack = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;

    const result = await deleteTrackService(trackId, userId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Track deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getTrackProgress = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;

    const progress = await getTrackProgressService(trackId, userId);
    
    res.status(200).json(
      new ApiResponse(200, progress, 'Track progress fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const archiveTrack = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;

    const track = await archiveTrackService(trackId, userId);
    
    res.status(200).json(
      new ApiResponse(200, track, 'Track archived successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const reactivateTrack = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const userId = req.user._id;

    const track = await reactivateTrackService(trackId, userId);
    
    res.status(200).json(
      new ApiResponse(200, track, 'Track reactivated successfully')
    );
  } catch (error) {
    next(error);
  }
};
