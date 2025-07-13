import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  submitOrUpdateOnboarding,
  getUserOnboarding
} from "../controllers/onboarding.controller.js";

const router = Router();

router.use(verifyJWT);

router.patch("/update-onboarding", submitOrUpdateOnboarding);
router.get("/myOnboarding", getUserOnboarding);

export default router;
