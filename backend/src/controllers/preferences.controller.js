import { ApiResponse } from "../utils/apiResponse.js";
import {
  submitOrUpdatePreferencesService,
  getUserPreferencesService

} from "../services/preferences.service.js";

export const submitOrUpdatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const payload = req.body;

    const preferences = await submitOrUpdatePreferencesService(userId, payload);

    return res
      .status(200)
      .json(ApiResponse.success(preferences, "preferences data saved/updated successfully"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
    });
  }
}

export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const preferences = await getUserPreferencesService(userId);

    return res
      .status(200)
      .json(ApiResponse.success(preferences, "User preferences data fetched successfully"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
    });
  }
};