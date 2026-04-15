import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import serviceRoutes from "./service.routes.js";
import vehicleRoutes from "./vehicle.routes.js";
import marketplaceRoutes from "./marketplace.routes.js";
import externalProxyRoutes from "./externalProxyRoutes.js"
import packageRoutes from "./package.routes.js";
import notificationRoutes from "./notification.routes.js";   // ← NEW


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/services", serviceRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/v1", externalProxyRoutes);
router.use("/packages", packageRoutes);
router.use("/notifications", notificationRoutes);
export default router;
