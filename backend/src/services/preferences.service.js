import { ApiError } from "../utils/apiError.js";
import { UserPreferences } from "../models/UserPreferences.js";

export const submitOrUpdatePreferencesService = async (userId, payload) => {
  try {
    if (!payload.availableHoursPerWeek || !payload.preferredLanguage) {
      throw ApiError.badRequest("availableHoursPerWeek and preferredLanguage are required");
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: payload },
      { upsert: true, new: true }
    )
    return preferences;
  } catch (error) {
    throw error;
  }
}

export const getUserPreferencesService = async (userId) => {
  try {
    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences) {
      throw ApiError.notFound("User preferences data not found");
    }
    return preferences;
  } catch (error) {
    throw error;
  }
};