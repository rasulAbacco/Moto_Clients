import express from "express";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  getPendingSellers,
  getPendingSellerCount,
  getSellerRegistrationDetail,
  approveSeller,
  rejectSeller,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/sellers/pending",
  authenticateUser,
  requireAuth,
  getPendingSellers,
);
router.get(
  "/sellers/notifications-count",
  authenticateUser,
  requireAuth,
  getPendingSellerCount,
);
router.get(
  "/sellers/:sellerProfileId",
  authenticateUser,
  requireAuth,
  getSellerRegistrationDetail,
);
router.patch(
  "/sellers/:sellerProfileId/approve",
  authenticateUser,
  requireAuth,
  approveSeller,
);
router.patch(
  "/sellers/:sellerProfileId/reject",
  authenticateUser,
  requireAuth,
  rejectSeller,
);


export default router;