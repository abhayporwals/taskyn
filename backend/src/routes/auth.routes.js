import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  sendEmailVerificationOTP,
  verifyEmailOTPController,
  sendPasswordResetOTP,
  resetPasswordWithOTPController,
  resendEmailVerificationOTP,
  resendPasswordResetOTP
} from "../controllers/user.controller.js";

const router = Router();

// Public authentication routes (no authentication required)
router.post("/register", upload.fields([{ name: "avatarUrl", maxCount: 1 }]), registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Email verification routes (public)
router.post("/send-email-verification", sendEmailVerificationOTP);
router.post("/verify-email", verifyEmailOTPController);
router.post("/resend-email-verification", resendEmailVerificationOTP);

// Password reset routes (public)
router.post("/send-password-reset", sendPasswordResetOTP);
router.post("/reset-password", resetPasswordWithOTPController);
router.post("/resend-password-reset", resendPasswordResetOTP);

// Protected authentication routes (authentication required)
router.use(verifyJWT); // Apply JWT verification middleware to all routes below
router.post("/logout", logoutUser);

export default router;
