import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  updateAccountDetailsService,
  updateUserAvatarService,
  changePasswordService,
  deleteAccountService,
  getCurrentUserService,
  sendEmailVerification,
  verifyEmailOTP,
  sendPasswordReset,
  resetPasswordWithOTP,
  resendEmailVerification,
  resendPasswordReset
} from "../services/user.service.js";
import { User } from "../models/User.js";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const avatarFile = req.files?.avatarUrl?.[0];

    const createdUser = await registerUserService(userData, avatarFile);

    return res
      .status(201)
      .json(ApiResponse.created(createdUser, "User registered successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const credentials = req.body;

    const result = await loginUserService(credentials);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    return res
      .status(200)
      .cookie("accessToken", result.accessToken, cookieOptions)
      .cookie("refreshToken", result.refreshToken, cookieOptions)
      .json(ApiResponse.success(
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        "User logged in successfully"
      ));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    await logoutUserService(userId);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(ApiResponse.success({}, "User logged out successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw ApiError.unauthorized("Unauthorized request");
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded?._id);
    if (!user) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw ApiError.unauthorized("Refresh token is expired or has been used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(ApiResponse.success(
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      ));
  } catch (error) {
    const status = error.statusCode || 401;
    return res.status(status).json({
      success: false,
      message: error.message || "Invalid or expired refresh token",
      errors: error.errors || [],
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await getCurrentUserService(userId);

    return res
      .status(200)
      .json(ApiResponse.success(user, "Current user fetched successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const updateAccountDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    const updateData = req.body;

    const updatedUser = await updateAccountDetailsService(userId, updateData);

    return res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Account details updated successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const updateUserAvatar = async (req, res) => {
  try {
    const userId = req.user?._id;
    const avatarFile = req.file;

    const updatedUser = await updateUserAvatarService(userId, avatarFile);

    return res
      .status(200)
      .json(ApiResponse.success(updatedUser, "Avatar updated successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id;
    const passwordData = req.body;

    const result = await changePasswordService(userId, passwordData);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Password changed successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { password } = req.body;

    const result = await deleteAccountService(userId, password);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(ApiResponse.success(result, "Account deleted successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const sendEmailVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest("Email is required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    const result = await sendEmailVerification(email);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Verification email sent successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const verifyEmailOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw ApiError.badRequest("Email and OTP are required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    const result = await verifyEmailOTP(email, otp);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Email verified successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest("Email is required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    const result = await sendPasswordReset(email);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Password reset email sent successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const resetPasswordWithOTPController = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw ApiError.badRequest("Email, OTP, and new password are required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    if (!validatePassword(newPassword)) {
      throw ApiError.badRequest("New password must be at least 6 characters long");
    }

    const result = await resetPasswordWithOTP(email, otp, newPassword);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Password reset successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const resendEmailVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest("Email is required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    const result = await resendEmailVerification(email);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Verification email resent successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

const resendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest("Email is required");
    }

    if (!validateEmail(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    const result = await resendPasswordReset(email);

    return res
      .status(200)
      .json(ApiResponse.success(result, "Password reset email resent successfully"));
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || [],
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  changePassword,
  deleteAccount,
  sendEmailVerificationOTP,
  verifyEmailOTPController,
  sendPasswordResetOTP,
  resetPasswordWithOTPController,
  resendEmailVerificationOTP,
  resendPasswordResetOTP
};
