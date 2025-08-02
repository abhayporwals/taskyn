import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import preferencesRoutes from "./preferences.routes.js";
import trackRoutes from "./track.routes.js";
import assignmentRoutes from "./assignment.routes.js";

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
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/preferences", preferencesRoutes);
router.use("/tracks", trackRoutes);
router.use("/assignments", assignmentRoutes);

// 404 handler for undefined routes
router.use("/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

export default router;
