import { GoogleGenerativeAI } from '@google/genai';
import { ApiError } from '../utils/ApiError.js';
import { Track } from '../models/Track.js';
import { Assignment } from '../models/Assignment.js';
import { UserPreferences } from '../models/UserPreferences.js';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  }

  /**
   * Generate a personalized learning track based on user preferences
   * @param {string} userId - The user ID
   * @param {Object} options - Additional options for track generation
   * @returns {Object} Generated track data
   */
  async generateTrack(userId, options = {}) {
    try {
      // Get user preferences
      const userPreferences = await UserPreferences.findOne({ userId });
      if (!userPreferences) {
        throw new ApiError(404, 'User preferences not found. Please complete your profile first.');
      }

      // Build personalized prompt for track generation
      const trackPrompt = this.buildTrackPrompt(userPreferences, options);
      
      const response = await this.model.generateContent(trackPrompt);
      const result = await response.response;
      const trackData = this.parseTrackResponse(result.text());

      // Create and save the track
      const track = new Track({
        userId,
        title: trackData.title,
        category: trackData.categories,
        totalTasks: trackData.totalTasks,
        generatedBy: 'ai'
      });

      await track.save();

      // Generate assignments for this track
      await this.generateAssignmentsForTrack(track._id, userId, userPreferences, trackData);

      return track;
    } catch (error) {
      throw new ApiError(500, `Failed to generate track: ${error.message}`);
    }
  }

  /**
   * Generate assignments for a specific track
   * @param {string} trackId - The track ID
   * @param {string} userId - The user ID
   * @param {Object} userPreferences - User preferences
   * @param {Object} trackData - Track information
   */
  async generateAssignmentsForTrack(trackId, userId, userPreferences, trackData) {
    try {
      const assignments = [];
      
      for (let i = 0; i < trackData.totalTasks; i++) {
        const assignmentPrompt = this.buildAssignmentPrompt(
          userPreferences, 
          trackData, 
          i + 1, 
          trackData.totalTasks
        );

        const response = await this.model.generateContent(assignmentPrompt);
        const result = await response.response;
        const assignmentData = this.parseAssignmentResponse(result.text());

        const assignment = new Assignment({
          userId,
          trackId,
          title: assignmentData.title,
          description: assignmentData.description,
          type: assignmentData.type,
          difficulty: assignmentData.difficulty,
          language: assignmentData.language,
          sampleSolution: assignmentData.sampleSolution,
          expectedOutput: assignmentData.expectedOutput
        });

        await assignment.save();
        assignments.push(assignment);
      }

      return assignments;
    } catch (error) {
      throw new ApiError(500, `Failed to generate assignments: ${error.message}`);
    }
  }

  /**
   * Generate a single assignment
   * @param {string} userId - The user ID
   * @param {string} trackId - The track ID
   * @param {Object} options - Assignment options
   * @returns {Object} Generated assignment
   */
  async generateAssignment(userId, trackId, options = {}) {
    try {
      const userPreferences = await UserPreferences.findOne({ userId });
      const track = await Track.findById(trackId);

      if (!userPreferences) {
        throw new ApiError(404, 'User preferences not found');
      }

      if (!track) {
        throw new ApiError(404, 'Track not found');
      }

      const assignmentPrompt = this.buildAssignmentPrompt(userPreferences, track, null, null, options);
      
      const response = await this.model.generateContent(assignmentPrompt);
      const result = await response.response;
      const assignmentData = this.parseAssignmentResponse(result.text());

      const assignment = new Assignment({
        userId,
        trackId,
        title: assignmentData.title,
        description: assignmentData.description,
        type: assignmentData.type,
        difficulty: assignmentData.difficulty,
        language: assignmentData.language,
        sampleSolution: assignmentData.sampleSolution,
        expectedOutput: assignmentData.expectedOutput
      });

      await assignment.save();
      return assignment;
    } catch (error) {
      throw new ApiError(500, `Failed to generate assignment: ${error.message}`);
    }
  }

  /**
   * Build prompt for track generation
   */
  buildTrackPrompt(userPreferences, options = {}) {
    const {
      interests = [],
      primaryGoals = [],
      secondaryGoals = [],
      skillLevels = {},
      preferredTopics = [],
      preferredLanguages = [],
      learningStyle = 'both',
      preferredAssignmentType = 'mixed',
      yearsOfExperience = 0,
      availableHoursPerWeek = 10
    } = userPreferences;

    return `
You are an expert programming instructor creating a personalized learning track. Generate a JSON response with the following structure:

{
  "title": "Track title (max 100 characters)",
  "categories": ["category1", "category2", "category3"],
  "totalTasks": number (between 5-15),
  "description": "Brief track description (max 200 characters)"
}

User Profile:
- Interests: ${interests.join(', ')}
- Primary Goals: ${primaryGoals.join(', ')}
- Secondary Goals: ${secondaryGoals.join(', ')}
- Skill Levels: ${JSON.stringify(skillLevels)}
- Preferred Topics: ${preferredTopics.join(', ')}
- Preferred Languages: ${preferredLanguages.join(', ')}
- Learning Style: ${learningStyle}
- Assignment Type Preference: ${preferredAssignmentType}
- Years of Experience: ${yearsOfExperience}
- Available Hours per Week: ${availableHoursPerWeek}

Requirements:
1. Create a focused track that aligns with user's primary goals
2. Consider their skill level and experience
3. Include 5-15 tasks based on available time
4. Categories should be relevant to their interests
5. Make it challenging but achievable

Respond only with valid JSON, no additional text.
    `;
  }

  /**
   * Build prompt for assignment generation
   */
  buildAssignmentPrompt(userPreferences, trackData, taskNumber, totalTasks, options = {}) {
    const {
      interests = [],
      skillLevels = {},
      preferredLanguages = [],
      learningStyle = 'both',
      preferredAssignmentType = 'mixed',
      yearsOfExperience = 0
    } = userPreferences;

    const { type, difficulty } = options;

    return `
You are an expert programming instructor creating a personalized assignment. Generate a JSON response with the following structure:

{
  "title": "Assignment title (max 100 characters)",
  "description": "Detailed assignment description with clear instructions",
  "type": "code|reading|project|mcq|mixed",
  "difficulty": "easy|medium|hard",
  "language": "programming language or 'mixed'",
  "sampleSolution": "Sample solution or approach (if applicable)",
  "expectedOutput": "Expected output or result description"
}

Context:
- Track: ${trackData.title || 'Custom Track'}
- Track Categories: ${Array.isArray(trackData.categories) ? trackData.categories.join(', ') : trackData.category?.join(', ') || 'General'}
- Task Number: ${taskNumber || 'Custom'}
- Total Tasks: ${totalTasks || 'N/A'}

User Profile:
- Interests: ${interests.join(', ')}
- Skill Levels: ${JSON.stringify(skillLevels)}
- Preferred Languages: ${preferredLanguages.join(', ')}
- Learning Style: ${learningStyle}
- Assignment Type Preference: ${preferredAssignmentType}
- Years of Experience: ${yearsOfExperience}

Requirements:
1. Assignment should be ${type || 'appropriate for the track'}
2. Difficulty should be ${difficulty || 'progressive based on task number'}
3. Consider user's skill level and experience
4. Make it practical and engaging
5. Include clear instructions and expected outcomes
6. If it's a coding assignment, provide a sample solution approach
7. Language should match user preferences when possible

Respond only with valid JSON, no additional text.
    `;
  }

  /**
   * Parse track response from Gemini
   */
  parseTrackResponse(responseText) {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const trackData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!trackData.title || !trackData.categories || !trackData.totalTasks) {
        throw new Error('Missing required fields in track data');
      }

      return {
        title: trackData.title,
        categories: Array.isArray(trackData.categories) ? trackData.categories : [trackData.categories],
        totalTasks: Math.min(Math.max(parseInt(trackData.totalTasks), 5), 15), // Ensure between 5-15
        description: trackData.description || ''
      };
    } catch (error) {
      throw new Error(`Failed to parse track response: ${error.message}`);
    }
  }

  /**
   * Parse assignment response from Gemini
   */
  parseAssignmentResponse(responseText) {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const assignmentData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!assignmentData.title || !assignmentData.description) {
        throw new Error('Missing required fields in assignment data');
      }

      return {
        title: assignmentData.title,
        description: assignmentData.description,
        type: this.validateAssignmentType(assignmentData.type),
        difficulty: this.validateDifficulty(assignmentData.difficulty),
        language: assignmentData.language || 'unknown',
        sampleSolution: assignmentData.sampleSolution || '',
        expectedOutput: assignmentData.expectedOutput || ''
      };
    } catch (error) {
      throw new Error(`Failed to parse assignment response: ${error.message}`);
    }
  }

  /**
   * Validate assignment type
   */
  validateAssignmentType(type) {
    const validTypes = ['code', 'reading', 'project', 'mcq', 'mixed'];
    return validTypes.includes(type) ? type : 'mixed';
  }

  /**
   * Validate difficulty level
   */
  validateDifficulty(difficulty) {
    const validDifficulties = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty) ? difficulty : 'medium';
  }

  /**
   * Generate AI feedback for a submitted assignment
   * @param {Object} assignment - The assignment object
   * @param {string} submissionContent - User's submission
   * @param {string} reflection - User's reflection
   * @returns {Object} AI feedback
   */
  async generateFeedback(assignment, submissionContent, reflection = '') {
    try {
      const feedbackPrompt = `
You are an expert programming instructor providing constructive feedback. Generate a JSON response with the following structure:

{
  "score": number (0-100),
  "feedback": "Detailed feedback on the submission",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"]
}

Assignment Details:
- Title: ${assignment.title}
- Description: ${assignment.description}
- Type: ${assignment.type}
- Difficulty: ${assignment.difficulty}
- Language: ${assignment.language}

Submission:
- Content: ${submissionContent}
- Reflection: ${reflection}

Provide constructive, encouraging feedback that helps the learner improve.
Respond only with valid JSON, no additional text.
      `;

      const response = await this.model.generateContent(feedbackPrompt);
      const result = await response.response;
      
      // Parse feedback response
      const jsonMatch = result.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid feedback response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new ApiError(500, `Failed to generate feedback: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();
