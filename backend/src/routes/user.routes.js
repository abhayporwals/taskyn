import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import {
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  changePassword,
  deleteAccount
} from "../controllers/user.controller.js";

const router = Router();

// All user management routes require authentication
router.use(verifyJWT); // Apply JWT verification middleware to all routes

router.get("/me", getCurrentUser);
router.patch("/update-account", updateAccountDetails);
router.patch("/update-avatar", upload.single("avatar"), updateUserAvatar);
router.patch("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);

export default router;
