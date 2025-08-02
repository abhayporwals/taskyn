import nodemailer from "nodemailer";
import { ApiError } from "../utils/apiError.js";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const getEmailVerificationTemplate = (otp, userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Taskyn</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-Based Skill Testing Platform</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Hi ${userName},<br><br>
          Thank you for registering with Taskyn! To complete your registration, please verify your email address by entering the following OTP:
        </p>
        
        <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This OTP will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            The Taskyn Team
          </p>
        </div>
      </div>
    </div>
  `;
};

const getPasswordResetTemplate = (otp, userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Taskyn</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-Based Skill Testing Platform</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Hi ${userName},<br><br>
          We received a request to reset your password. Use the following OTP to complete the password reset process:
        </p>
        
        <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This OTP will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            Best regards,<br>
            The Taskyn Team
          </p>
        </div>
      </div>
    </div>
  `;
};

export const sendEmailVerificationOTP = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Taskyn" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Taskyn",
      html: getEmailVerificationTemplate(otp, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email verification OTP sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email verification OTP:", error);
    throw new ApiError(500, "Failed to send verification email");
  }
};

export const sendPasswordResetOTP = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Taskyn" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Taskyn",
      html: getPasswordResetTemplate(otp, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset OTP sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    throw new ApiError(500, "Failed to send password reset email");
  }
};

export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}; 