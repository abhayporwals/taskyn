import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  generateAIAssignmentService,
  getAssignmentsByTrackService,
  getAssignmentByIdService,
  updateAssignmentService,
  deleteAssignmentService,
  submitAssignmentService,
  getUserAssignmentsService,
  getAssignmentStatsService
} from '../services/assignment.service.js';

export const generateAIAssignment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { trackId } = req.params;
    const options = req.body;

    const assignment = await generateAIAssignmentService(userId, trackId, options);
    
    res.status(201).json(
      new ApiResponse(201, assignment, 'AI assignment generated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAssignmentsByTrack = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { trackId } = req.params;
    const filters = {
      type: req.query.type,
      difficulty: req.query.difficulty,
      isCompleted: req.query.isCompleted === 'true' ? true : req.query.isCompleted === 'false' ? false : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const assignments = await getAssignmentsByTrackService(trackId, userId, filters);
    
    res.status(200).json(
      new ApiResponse(200, assignments, 'Assignments fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assignmentId } = req.params;

    const assignment = await getAssignmentByIdService(assignmentId, userId);
    
    res.status(200).json(
      new ApiResponse(200, assignment, 'Assignment fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assignmentId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.trackId;
    delete updateData.isCompleted;
    delete updateData.submittedAt;
    delete updateData.submissionContent;
    delete updateData.submissionType;
    delete updateData.reflection;
    delete updateData.aiFeedbackId;

    const assignment = await updateAssignmentService(assignmentId, userId, updateData);
    
    res.status(200).json(
      new ApiResponse(200, assignment, 'Assignment updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assignmentId } = req.params;

    const result = await deleteAssignmentService(assignmentId, userId);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Assignment deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { assignmentId } = req.params;
    const { submissionContent, submissionType = 'text', reflection = '' } = req.body;

    if (!submissionContent) {
      throw new ApiError(400, 'Submission content is required');
    }

    const assignment = await submitAssignmentService(assignmentId, userId, {
      submissionContent,
      submissionType,
      reflection
    });
    
    res.status(200).json(
      new ApiResponse(200, assignment, 'Assignment submitted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getUserAssignments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const filters = {
      trackId: req.query.trackId,
      type: req.query.type,
      difficulty: req.query.difficulty,
      isCompleted: req.query.isCompleted === 'true' ? true : req.query.isCompleted === 'false' ? false : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const assignments = await getUserAssignmentsService(userId, filters);
    
    res.status(200).json(
      new ApiResponse(200, assignments, 'User assignments fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAssignmentStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await getAssignmentStatsService(userId);
    
    res.status(200).json(
      new ApiResponse(200, stats, 'Assignment statistics fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};
