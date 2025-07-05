import jwt from "jsonwebtoken";

export const generateAccessToken = ({ _id, email, name }) => {
    return jwt.sign({ _id, email, name }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        algorithm: "HS256"
    });
}

export const generateRefreshToken = ({ _id }) => {
    return jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        algorithm: "HS256"
    });
}