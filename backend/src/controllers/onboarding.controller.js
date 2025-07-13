import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/apiResponse";
import { UserOnboarding } from "../models/UserOnboarding";
import jwt from "jsonwebtoken";
import {
     submitOrUpdateOnboardingService,

 } from "../services/onboarding.service";

export const submitOrUpdateOnboarding= async(req,res)=>{
    try{
        const userId = req.user._id;
        const payload = req.body;

        const onboarding = await submitOrUpdateOnboardingService(userId,payload);

        return res
            .status(200)
            .json(ApiResponse.success(onboarding, "Onboarding data saved/updated successfully"));
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            errors: err.errors || [],
        });
    }
}

export const getUserOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;

    const onboarding = await getUserOnboardingService(userId);

    return res
      .status(200)
      .json(ApiResponse.success(onboarding, "User onboarding data fetched successfully"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
    });
  }
};