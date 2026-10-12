import { Router } from "express";
import { authenticateUser, requireAuth } from "../middleware/authMiddleware.js";
import {
  getBuyerStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getMyInquiries,
  getBuyerProfile,
  updateBuyerProfile,
  createPurchaseRequest,
  getMyPurchaseRequests,
  cancelPurchaseRequest,
  getBuyerNotifications,
  markBuyerNotificationRead,
  markAllBuyerNotificationsRead,
} from "../controllers/buyerController.js";

const router = Router();
const guard = [authenticateUser, requireAuth];

router.get("/dashboard", ...guard, getBuyerStats);
router.get("/wishlist", ...guard, getWishlist);
router.post("/wishlist", ...guard, addToWishlist);
router.delete("/wishlist/:vehicleListingId", ...guard, removeFromWishlist);
router.get("/inquiries", ...guard, getMyInquiries);
router.get("/profile", ...guard, getBuyerProfile);
router.patch("/profile", ...guard, updateBuyerProfile);
router.get("/notifications", ...guard, getBuyerNotifications);
router.patch("/notifications/:id/read", ...guard, markBuyerNotificationRead);
router.patch(
  "/notifications/read-all",
  ...guard,
  markAllBuyerNotificationsRead,
);

// Purchase Requests
router.post("/purchase-requests", ...guard, createPurchaseRequest);
router.get("/purchase-requests", ...guard, getMyPurchaseRequests);
router.patch("/purchase-requests/:id/cancel", ...guard, cancelPurchaseRequest);

export default router;
