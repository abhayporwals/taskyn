import { ApiError } from "../utils/ApiError";
import { UserOnboarding } from "../models/UserOnboarding";

export const submitOrUpdateOnboardingService=async(userId,payload)=>{
    try{
        if(!payload.availableHoursPerWeek||!payload.preferredLanguage){
            throw ApiError.badRequest("availableHoursPerWeek and preferredLanguage are required");
        }

        const onboarding=await UserOnboarding.findOneAndUpdate(
            {userId},
            {$set:payload},
            {upsert:true,new:true}
        )

        return onboarding;
    }catch(error){
        throw error;
    }
}

export const getUserOnboardingService = async (userId) => {
  try {
    const onboarding = await UserOnboarding.findOne({ userId });

    if (!onboarding) {
      throw ApiError.notFound("User onboarding data not found");
    }

    return onboarding;
  } catch (error) {
    throw error;
  }
};