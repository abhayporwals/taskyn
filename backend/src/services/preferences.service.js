import { ApiError } from "../utils/apiError.js";
import { Userpreferences } from "../models/UserPreferences.js";

export const submitOrUpdatePreferencesService = async (userId, payload) => {
  try {
    if (!payload.availableHoursPerWeek || !payload.preferredLanguage) {
      throw ApiError.badRequest("availableHoursPerWeek and preferredLanguage are required");
    }

    const preferences = await Userpreferences.findOneAndUpdate(
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
    const preferences = await Userpreferences.findOne({ userId });

    if (!preferences) {
      throw ApiError.notFound("User preferences data not found");
    }
    return preferences;
  } catch (error) {
    throw error;
  }
};