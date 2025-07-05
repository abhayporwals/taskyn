import bcrypt from "bcrypt";
import {ApiError} from "./ApiError.js"


export const hashPassword = async (plainPassword) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new ApiError(400, "Password hashing failed", [error.message]);
    }
}

export const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw new ApiError(400, "Password comparison failed", [error.message]);
    }
}