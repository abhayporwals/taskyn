import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import assignmentRoutes from "./assignment.routes.js";
import trackRoutes from "./track.routes.js";
import exploreRoutes from "./explore.routes.js";
import onboardingRoutes from "./onboarding.routes.js"

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Taskyn API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API routes
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/assignments", assignmentRoutes);
router.use("/api/v1/tracks", trackRoutes);
router.use("/api/v1/explore", exploreRoutes);
router.use("api/v1/onboarding",onboardingRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

export default router;
