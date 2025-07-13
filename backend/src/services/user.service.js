import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmailVerificationOTP, sendPasswordResetOTP } from "./email.service.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { comparePassword } from "../utils/hash.js";
import { generateAccessAndRefreshTokens } from "./auth.service.js";

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return file && allowedTypes.includes(file.mimetype);
};

// User registration service
export const registerUserService = async (userData, avatarFile) => {
  try {
    const { fullName, userName, email, password } = userData;

    // Input validation
    if ([fullName, userName, email, password].some(field => !field?.trim())) {
      throw ApiError.badRequest("All fields are required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    if (!validatePassword(password)) {
      throw ApiError.badRequest("Password must be at least 6 characters long");
    }

    if (userName.length < 3) {
      throw ApiError.badRequest("Username must be at least 3 characters long");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ userName: userName.toLowerCase() }, { email }],
    });

    if (existedUser) {
      throw ApiError.conflict("User with email or username already exists");
    }

    // Handle avatar upload
    let avatarUrl = "";
    if (avatarFile) {
      if (!validateFileType(avatarFile)) {
        throw ApiError.badRequest("Invalid file type. Only JPEG, PNG, and WebP images are allowed");
      }

      const avatar = await uploadOnCloudinary(avatarFile.path);
      if (!avatar?.url) {
        throw ApiError.badRequest("Failed to upload avatar");
      }
      avatarUrl = avatar.url;
    } else {
      throw ApiError.badRequest("Avatar file is required");
    }

    // Create user
    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
      avatarUrl,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw ApiError.internalServerError("Failed to register user");
    }

    return createdUser;
  } catch (error) {
    throw error;
  }
};

// User login service
export const loginUserService = async (credentials) => {
  try {
    const { email, userName, password } = credentials;

    if (!email && !userName) {
      throw ApiError.badRequest("Email or username is required");
    }

    if (!password) {
      throw ApiError.badRequest("Password is required");
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email }, { userName: userName?.toLowerCase() }],
    });

    if (!user) {
      throw ApiError.notFound("User does not exist");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid user credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return {
      user: loggedInUser,
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw error;
  }
};

// User logout service
export const logoutUserService = async (userId) => {
  try {
    if (!userId) {
      throw ApiError.unauthorized("Unauthorized access");
    }

    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    return { message: "User logged out successfully" };
  } catch (error) {
    throw error;
  }
};

// Update account details service
export const updateAccountDetailsService = async (userId, updateData) => {
  try {
    const { fullName, email } = updateData;

    if (!fullName || !email) {
      throw ApiError.badRequest("All fields are required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });

    if (existingUser) {
      throw ApiError.conflict("Email is already taken by another user");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { fullName, email } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Update user avatar service
export const updateUserAvatarService = async (userId, avatarFile) => {
  try {
    if (!avatarFile) {
      throw ApiError.badRequest("Avatar file is missing");
    }

    // Validate file type
    if (!validateFileType(avatarFile)) {
      throw ApiError.badRequest("Invalid file type. Only JPEG, PNG, and WebP images are allowed");
    }

    const avatar = await uploadOnCloudinary(avatarFile.path);

    if (!avatar?.url) {
      throw ApiError.badRequest("Error while uploading avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { avatarUrl: avatar.url } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// Change password service
export const changePasswordService = async (userId, passwordData) => {
  try {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest("Current password and new password are required");
    }

    if (!validatePassword(newPassword)) {
      throw ApiError.badRequest("New password must be at least 6 characters long");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    throw error;
  }
};

// Delete account service
export const deleteAccountService = async (userId, password) => {
  try {
    if (!password) {
      throw ApiError.badRequest("Password is required to delete account");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Password is incorrect");
    }

    await User.findByIdAndDelete(userId);

    return { message: "Account deleted successfully" };
  } catch (error) {
    throw error;
  }
};

// Get current user service
export const getCurrentUserService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Send email verification OTP
export const sendEmailVerification = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();

    await sendEmailVerificationOTP(email, otp, user.fullName);

    return { message: "Verification email sent successfully" };
  } catch (error) {
    throw error;
  }
};

// Verify email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    const isValidOTP = user.verifyEmailOTP(otp);
    
    if (!isValidOTP) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.clearEmailVerificationOTP();
    await user.save();

    return { message: "Email verified successfully" };
  } catch (error) {
    throw error;
  }
};

// Send password reset OTP
export const sendPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const otp = user.generatePasswordResetOTP();
    await user.save();

    await sendPasswordResetOTP(email, otp, user.fullName);

    return { message: "Password reset email sent successfully" };
  } catch (error) {
    throw error;
  }
};

// Reset password with OTP
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isValidOTP = user.verifyPasswordResetOTP(otp);
    
    if (!isValidOTP) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    user.password = newPassword;
    User.clearPasswordResetOTP();
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    throw error;
  }
};

// Resend email verification OTP
export const resendEmailVerification = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    // Check if previous OTP is still valid (within 1 minute)
    if (user.emailVerificationOTP && user.emailVerificationOTP.expiresAt) {
      const timeDiff = new Date(user.emailVerificationOTP.expiresAt) - new Date();
      if (timeDiff > 9 * 60 * 1000) { // More than 9 minutes remaining
        throw ApiError.badRequest("Please wait before requesting another OTP");
      }
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();

    await sendEmailVerificationOTP(email, otp, user.fullName);

    return { message: "Verification email resent successfully" };
  } catch (error) {
    throw error;
  }
};

// Resend password reset OTP
export const resendPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Check if previous OTP is still valid (within 1 minute)
    if (user.passwordResetOTP && user.passwordResetOTP.expiresAt) {
      const timeDiff = new Date(user.passwordResetOTP.expiresAt) - new Date();
      if (timeDiff > 9 * 60 * 1000) { // More than 9 minutes remaining
        throw ApiError.badRequest("Please wait before requesting another OTP");
      }
    }

    const otp = user.generatePasswordResetOTP();
    await user.save();

    await sendPasswordResetOTP(email, otp, user.fullName);

    return { message: "Password reset email resent successfully" };
  } catch (error) {
    throw error;
  }
};
