import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/User.js";
import { comparePassword } from "../utils/hash.js";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js";

const registerUser = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;

    if ([fullName, userName, email, password].some(field => !field?.trim())) {
      throw ApiError.badRequest("All fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ userName: userName.toLowerCase() }, { email }],
    });

    if (existedUser) {
      throw ApiError.conflict("User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatarUrl?.[0]?.path;

    if (!avatarLocalPath) {
      throw ApiError.badRequest("Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
      throw ApiError.badRequest("Failed to upload avatar");
    }

    const user = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
      avatarUrl: avatar.url,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw ApiError.internalServerError("Failed to register user");
    }

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
    const { email, userName, password } = req.body;

    if (!email && !userName) {
      throw ApiError.badRequest("Email or username is required");
    }

    const user = await User.findOne({
      $or: [{ email }, { userName: userName?.toLowerCase() }],
    });

    if (!user) {
      throw ApiError.notFound("User does not exist");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(ApiResponse.success(
        { user: loggedInUser, accessToken, refreshToken },
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

    if (!userId) {
      throw ApiError.unauthorized("Unauthorized access");
    }

    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    const cookieOptions = { httpOnly: true, secure: true };

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
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized("Unauthorized request");
  }

  try {
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

    const cookieOptions = { httpOnly: true, secure: true };

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
    return res
      .status(200)
      .json(ApiResponse.success(req.user, "Current user fetched successfully"));
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
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      throw ApiError.badRequest("All fields are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { fullName, email } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

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
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw ApiError.badRequest("Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
      throw ApiError.badRequest("Error while uploading avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { avatarUrl: avatar.url } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw ApiError.notFound("User not found");
    }

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

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar
};
