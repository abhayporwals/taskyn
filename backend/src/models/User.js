import mongoose from "mongoose"
import { hashPassword, comparePassword } from "../utils/hash"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt"

const userSchema = new mongoose.Schema({
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

export const User = mongoose.model("User", userSchema)