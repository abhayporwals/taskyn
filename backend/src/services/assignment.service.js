import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Track } from '../models/Track.js';
import { Feedback } from '../models/Feedback.js';
import { ApiError } from '../utils/apiError.js';
import { geminiService } from './gemini.service.js';

export const generateAIAssignmentService = async (userId, trackId, options = {}) => {
  try {
    const assignment = await geminiService.generateAssignment(userId, trackId, options);
    return assignment;
  } catch (error) {
    throw error;
  }
};

export const getAssignmentsByTrackService = async (trackId, userId, filters = {}) => {
  try {
    const query = { trackId, userId };
    
    // Apply filters
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    if (filters.isCompleted !== undefined) {
      query.isCompleted = filters.isCompleted;
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: 1 })
      .populate('trackId', 'title category');

    return assignments;
  } catch (error) {
    throw new ApiError(500, `Failed to fetch assignments: ${error.message}`);
  }
};

export const getAssignmentByIdService = async (assignmentId, userId) => {
  try {
    const assignment = await Assignment.findOne({ _id: assignmentId, userId })
      .populate('trackId', 'title category')
      .populate('aiFeedbackId');

    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }
    
    return assignment;
  } catch (error) {
    throw error;
  }
};

export const updateAssignmentService = async (assignmentId, userId, updateData) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, userId },
      { $set: updateData },
      { new: true }
    );

    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    return assignment;
  } catch (error) {
    throw new ApiError(500, `Failed to update assignment: ${error.message}`);
  }
};

export const deleteAssignmentService = async (assignmentId, userId) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: assignmentId, userId });
    
    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    return { message: 'Assignment deleted successfully' };
  } catch (error) {
    throw new ApiError(500, `Failed to delete assignment: ${error.message}`);
  }
};

export const submitAssignmentService = async (assignmentId, userId, submissionData) => {
  try {
    const { submissionContent, submissionType = 'text', reflection = '' } = submissionData;

    const assignment = await Assignment.findOne({ _id: assignmentId, userId });
    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    if (assignment.isCompleted) {
      throw new ApiError(400, 'Assignment already completed');
    }

    // Update assignment with submission
    assignment.isCompleted = true;
    assignment.submittedAt = new Date();
    assignment.submissionContent = submissionContent;
    assignment.submissionType = submissionType;
    assignment.reflection = reflection;

    // Generate AI feedback if user wants feedback
    if (assignment.reflection && assignment.reflection.trim()) {
      try {
        const feedbackData = await geminiService.generateFeedback(
          assignment,
          submissionContent,
          reflection
        );
        
        // Create and save feedback to the Feedback model
        const feedback = new Feedback({
          assignmentId: assignment._id,
          generatedBy: 'ai',
          score: feedbackData.score,
          feedbackText: feedbackData.feedback
        });
        
        await feedback.save();
        
        // Link the feedback to the assignment
        assignment.aiFeedbackId = feedback._id;
      } catch (feedbackError) {
        console.error('Failed to generate AI feedback:', feedbackError);
        // Continue without feedback if AI fails
      }
    }

    await assignment.save();

    // Update track progress
    await updateTrackProgress(assignment.trackId, userId);

    return assignment;
  } catch (error) {
    throw new ApiError(500, `Failed to submit assignment: ${error.message}`);
  }
};

export const getUserAssignmentsService = async (userId, filters = {}) => {
  try {
    const query = { userId };
    
    // Apply filters
    if (filters.trackId) {
      query.trackId = filters.trackId;
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    if (filters.isCompleted !== undefined) {
      query.isCompleted = filters.isCompleted;
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .populate('trackId', 'title category');

    return assignments;
  } catch (error) {
    throw new ApiError(500, `Failed to fetch user assignments: ${error.message}`);
  }
};

export const getAssignmentStatsService = async (userId) => {
  try {
    const stats = await Assignment.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          completedAssignments: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          assignmentsByType: {
            $push: {
              type: '$type',
              isCompleted: '$isCompleted'
            }
          },
          assignmentsByDifficulty: {
            $push: {
              difficulty: '$difficulty',
              isCompleted: '$isCompleted'
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalAssignments: 0,
        completedAssignments: 0,
        completionRate: 0,
        typeBreakdown: {},
        difficultyBreakdown: {}
      };
    }

    const stat = stats[0];
    const completionRate = stat.totalAssignments > 0 
      ? (stat.completedAssignments / stat.totalAssignments) * 100 
      : 0;

    // Calculate type breakdown
    const typeBreakdown = {};
    stat.assignmentsByType.forEach(item => {
      if (!typeBreakdown[item.type]) {
        typeBreakdown[item.type] = { total: 0, completed: 0 };
      }
      typeBreakdown[item.type].total++;
      if (item.isCompleted) {
        typeBreakdown[item.type].completed++;
      }
    });

    // Calculate difficulty breakdown
    const difficultyBreakdown = {};
    stat.assignmentsByDifficulty.forEach(item => {
      if (!difficultyBreakdown[item.difficulty]) {
        difficultyBreakdown[item.difficulty] = { total: 0, completed: 0 };
      }
      difficultyBreakdown[item.difficulty].total++;
      if (item.isCompleted) {
        difficultyBreakdown[item.difficulty].completed++;
      }
    });

    return {
      totalAssignments: stat.totalAssignments,
      completedAssignments: stat.completedAssignments,
      completionRate,
      typeBreakdown,
      difficultyBreakdown
    };
  } catch (error) {
    throw new ApiError(500, `Failed to get assignment stats: ${error.message}`);
  }
};

// Helper function to update track progress
const updateTrackProgress = async (trackId, userId) => {
  try {
    const track = await Track.findOne({ _id: trackId, userId });
    if (!track) return;

    const totalAssignments = await Assignment.countDocuments({ trackId, userId });
    const completedAssignments = await Assignment.countDocuments({ 
      trackId, 
      userId, 
      isCompleted: true 
    });

    track.totalTasks = totalAssignments;
    track.completedTasks = completedAssignments;

    // Update status to completed if all tasks are done
    if (completedAssignments === totalAssignments && totalAssignments > 0) {
      track.status = 'completed';
    }

    await track.save();
  } catch (error) {
    console.error('Failed to update track progress:', error);
  }
};
