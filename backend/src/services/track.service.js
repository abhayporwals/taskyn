import { Track } from '../models/Track.js';
import { Assignment } from '../models/Assignment.js';
import { ApiError } from '../utils/ApiError.js';
import { geminiService } from './gemini.service.js';

export const generateAITrackService = async (userId, options = {}) => {
  try {
    const track = await geminiService.generateTrack(userId, options);
    return track;
  } catch (error) {
    throw error;
  }
};

export const getUserTracksService = async (userId, filters = {}) => {
  try {
    const query = { userId };
    
    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.generatedBy) {
      query.generatedBy = filters.generatedBy;
    }

    const tracks = await Track.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName userName email');

    return tracks;
  } catch (error) {
    throw new ApiError(500, `Failed to fetch tracks: ${error.message}`);
  }
};

export const getTrackByIdService = async (trackId, userId) => {
  try {
    const track = await Track.findOne({ _id: trackId, userId })
      .populate('userId', 'fullName userName email');

    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    return track;
  } catch (error) {
    throw error;
  }
};

export const updateTrackService = async (trackId, userId, updateData) => {
  try {
    const track = await Track.findOneAndUpdate(
      { _id: trackId, userId },
      { $set: updateData },
      { new: true }
    );

    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    return track;
  } catch (error) {
    throw new ApiError(500, `Failed to update track: ${error.message}`);
  }
};

export const deleteTrackService = async (trackId, userId) => {
  try {
    // Delete the track and all associated assignments
    const track = await Track.findOneAndDelete({ _id: trackId, userId });
    
    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    // Delete all assignments associated with this track
    await Assignment.deleteMany({ trackId });

    return { message: 'Track and associated assignments deleted successfully' };
  } catch (error) {
    throw new ApiError(500, `Failed to delete track: ${error.message}`);
  }
};

export const getTrackProgressService = async (trackId, userId) => {
  try {
    const track = await Track.findOne({ _id: trackId, userId });
    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    const assignments = await Assignment.find({ trackId, userId });
    
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(assignment => assignment.isCompleted).length;
    const progressPercentage = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    return {
      track,
      totalAssignments,
      completedAssignments,
      progressPercentage,
      assignments
    };
  } catch (error) {
    throw new ApiError(500, `Failed to get track progress: ${error.message}`);
  }
};

export const archiveTrackService = async (trackId, userId) => {
  try {
    const track = await Track.findOneAndUpdate(
      { _id: trackId, userId },
      { $set: { status: 'archived' } },
      { new: true }
    );

    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    return track;
  } catch (error) {
    throw new ApiError(500, `Failed to archive track: ${error.message}`);
  }
};

export const reactivateTrackService = async (trackId, userId) => {
  try {
    const track = await Track.findOneAndUpdate(
      { _id: trackId, userId },
      { $set: { status: 'active' } },
      { new: true }
    );

    if (!track) {
      throw new ApiError(404, 'Track not found');
    }

    return track;
  } catch (error) {
    throw new ApiError(500, `Failed to reactivate track: ${error.message}`);
  }
};
