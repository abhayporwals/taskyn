import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  getUserPreferences,
  getUserPreferences
} from "../controllers/preferences.controller.js";

const router = Router();

router.use(verifyJWT);

router.patch("/update-preferences", getUserPreferences);
router.get("/all", getUserPreferences);

export default router;