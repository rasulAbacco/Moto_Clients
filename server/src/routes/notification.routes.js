// src/routes/notification.routes.js
import express from "express";
import { getNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Fetch notifications for app user
 * @query   phone=919876543210  (optional — include to get USER-scoped ones too)
 *
 * Logic:
 *   - Always returns all GLOBAL notifications (packages, announcements)
 *   - If phone is provided, also returns USER-scoped ones (booking accepted/rejected)
 *
 * No auth required — phone is the user identifier for USER-scoped notifs.
 */
router.get("/", getNotifications);

export default router;