import mongoose from "mongoose"
import { hashPassword, comparePassword } from "../utils/hash.js"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js"

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: [true, "Username is required"],
    },
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "E-mail is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    avatarUrl: {
        type: String,
        required: [true, "Avatar is required"]
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        otp: String,
        expiresAt: Date
    },
    passwordResetOTP: {
        otp: String,
        expiresAt: Date
    },
    streakCount: {
        type: Number,
        default: 0
    },
    lastCompletedAt: {
        type: Date,
        default: null
    },
    totalCompleted: {
        type: Number,
        default: 0
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await hashPassword(this.password);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await comparePassword(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return generateAccessToken({
    _id: this._id,
    email: this.email,
    name: this.name,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return generateRefreshToken({
    _id: this._id,
  });
};

userSchema.methods.generateEmailVerificationOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  this.emailVerificationOTP = {
    otp,
    expiresAt
  };
  
  return otp;
};

userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  this.passwordResetOTP = {
    otp,
    expiresAt
  };
  
  return otp;
};

userSchema.methods.verifyEmailOTP = function(otp) {
  if (!this.emailVerificationOTP || !this.emailVerificationOTP.otp) {
    return false;
  }
  
  if (new Date() > this.emailVerificationOTP.expiresAt) {
    return false;
  }
  
  return this.emailVerificationOTP.otp === otp;
};

userSchema.methods.verifyPasswordResetOTP = function(otp) {
  if (!this.passwordResetOTP || !this.passwordResetOTP.otp) {
    return false;
  }
  
  if (new Date() > this.passwordResetOTP.expiresAt) {
    return false;
  }
  
  return this.passwordResetOTP.otp === otp;
};

userSchema.methods.clearEmailVerificationOTP = function() {
  this.emailVerificationOTP = undefined;
};

userSchema.methods.clearPasswordResetOTP = function() {
  this.passwordResetOTP = undefined;
};

export const User = mongoose.model("User", userSchema)