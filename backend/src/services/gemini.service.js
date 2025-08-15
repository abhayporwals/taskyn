import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/ApiError.js';
import { Track } from '../models/Track.js';
import { Assignment } from '../models/Assignment.js';
import { UserPreferences } from '../models/UserPreferences.js';

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  }

  async generateWithPrompt(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("No text response from Gemini");
      }

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }


  async generateTrack(userId, options = {}) {
    try {
      const userPreferences = await UserPreferences.findOne({ userId });
      if (!userPreferences) {
        throw new ApiError(404, 'User preferences not found. Please complete your profile first.');
      }

      const prompt = this.buildTrackPrompt(userPreferences, options);
      const responseText = await this.generateWithPrompt(prompt);
      const trackData = this.parseTrackResponse(responseText);

      const track = new Track({
        userId,
        title: trackData.title,
        category: trackData.categories,
        totalTasks: trackData.totalTasks,
        generatedBy: 'ai'
      });

      await track.save();
      await this.generateAssignmentsForTrack(track._id, userId, userPreferences, trackData);

      return track;
    } catch (error) {
      throw new ApiError(500, `Failed to generate track: ${error.message}`);
    }
  }

  async generateAssignmentsForTrack(trackId, userId, userPreferences, trackData) {
    try {
      const assignments = [];

      for (let i = 0; i < trackData.totalTasks; i++) {
        const prompt = this.buildAssignmentPrompt(userPreferences, trackData, i + 1, trackData.totalTasks);
        const responseText = await this.generateWithPrompt(prompt);
        const assignmentData = this.parseAssignmentResponse(responseText);

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

  async generateAssignment(userId, trackId, options = {}) {
    try {
      const userPreferences = await UserPreferences.findOne({ userId });
      const track = await Track.findById(trackId);

      if (!userPreferences) throw new ApiError(404, 'User preferences not found');
      if (!track) throw new ApiError(404, 'Track not found');

      const prompt = this.buildAssignmentPrompt(userPreferences, track, null, null, options);
      const responseText = await this.generateWithPrompt(prompt);
      const assignmentData = this.parseAssignmentResponse(responseText);

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

  async generateFeedback(assignment, submissionContent, reflection = '') {
    try {
      const feedbackPrompt = `Provide constructive feedback for this programming assignment.

Assignment: ${assignment.title}
Type: ${assignment.type}
Difficulty: ${assignment.difficulty}

Submission: ${submissionContent.substring(0, 500)}
Reflection: ${reflection.substring(0, 200)}

Generate JSON with this structure (no markdown, no extra text):
{
  "score": 85,
  "feedback": "Brief, constructive feedback (max 200 characters)",
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"]
}

Keep feedback concise and encouraging. Return only valid JSON.`.trim();

      const responseText = await this.generateWithPrompt(feedbackPrompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid feedback response format');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new ApiError(500, `Failed to generate feedback: ${error.message}`);
    }
  }

  // Prompt builders and parsers remain the same
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

    return `You are an expert programming instructor. Create a personalized learning track based on the user profile.

User Profile:
- Interests: ${interests.join(', ') || 'General programming'}
- Primary Goals: ${primaryGoals.join(', ') || 'Skill development'}
- Secondary Goals: ${secondaryGoals.join(', ') || 'Career growth'}
- Skill Levels: ${Object.keys(skillLevels).length > 0 ? JSON.stringify(skillLevels) : 'Beginner'}
- Preferred Topics: ${preferredTopics.join(', ') || 'Web development'}
- Preferred Languages: ${preferredLanguages.join(', ') || 'JavaScript, Python'}
- Learning Style: ${learningStyle}
- Assignment Type: ${preferredAssignmentType}
- Experience: ${yearsOfExperience} years
- Weekly Hours: ${availableHoursPerWeek}

Generate a JSON response with exactly this structure (no markdown, no extra text):
{
  "title": "Track title (max 100 characters)",
  "categories": ["category1", "category2", "category3"],
  "totalTasks": 8,
  "description": "Brief track description (max 200 characters)"
}

Requirements:
- Title should be specific and engaging
- Categories should be 2-4 relevant programming areas
- Total tasks: 5-15 based on available time
- Description should be clear and motivating
- Focus on practical, job-relevant skills

Return only valid JSON.`.trim();
  }

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

    return `Create a programming assignment for task ${taskNumber || 1} of ${totalTasks || 1}.

Track: ${trackData.title || 'Custom Track'}
Categories: ${Array.isArray(trackData.categories) ? trackData.categories.join(', ') : trackData.category?.join(', ') || 'General'}

User Profile:
- Interests: ${interests.join(', ') || 'Programming'}
- Skill Level: ${Object.keys(skillLevels).length > 0 ? 'Mixed levels' : 'Beginner'}
- Languages: ${preferredLanguages.join(', ') || 'JavaScript, Python'}
- Experience: ${yearsOfExperience} years

Generate JSON with this exact structure (no markdown, no extra text):
{
  "title": "Assignment title (max 80 characters)",
  "description": "Clear, concise assignment description (max 300 characters)",
  "type": "code",
  "difficulty": "medium",
  "language": "JavaScript",
  "sampleSolution": "Brief solution approach (max 200 characters)",
  "expectedOutput": "Expected result description (max 150 characters)"
}

Requirements:
- Keep descriptions concise and practical
- Focus on hands-on coding practice
- Make it engaging and achievable
- Return only valid JSON`.trim();
  }

  parseTrackResponse(responseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const trackData = JSON.parse(jsonMatch[0]);
    if (!trackData.title || !trackData.categories || !trackData.totalTasks) {
      throw new Error('Missing required fields in track data');
    }

    return {
      title: trackData.title,
      categories: Array.isArray(trackData.categories) ? trackData.categories : [trackData.categories],
      totalTasks: Math.min(Math.max(parseInt(trackData.totalTasks), 5), 15),
      description: trackData.description || ''
    };
  }

  parseAssignmentResponse(responseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const assignmentData = JSON.parse(jsonMatch[0]);
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
  }

  validateAssignmentType(type) {
    const validTypes = ['code', 'reading', 'project', 'mcq', 'mixed'];
    return validTypes.includes(type) ? type : 'mixed';
  }

  validateDifficulty(difficulty) {
    const validDifficulties = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty) ? difficulty : 'medium';
  }
}

export const geminiService = new GeminiService();

