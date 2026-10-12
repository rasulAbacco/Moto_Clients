import { Router } from "express";
import { uploadFields } from "../middleware/upload.middleware.js";
import {
  registerSeller,
  getSellerDashboard,
  getSellerStatus,
  getMyVehicles,
  deleteMyVehicle,
  getSellerStats,
  getSalesPerformance,
  getSellerInquiries,
  getSellerInspections,
  getSellerInspectionById,
  getSellerNotifications,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
  deleteSellerNotification,
  getMyProfile,
  updateMyProfile,
  uploadMyDocuments,
  deleteMyDocument,
  getPurchaseRequestsForMe,
  acceptPurchaseRequest,
  rejectPurchaseRequest,
  getPurchaseRequestById,
} from "../controllers/sellerController.js";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = Router();
router.post(
  "/register",
  authenticateUser, // attaches req.user if a valid token is present
  requireAuth, // blocks the request if req.user is still null
  uploadFields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "shopLogo", maxCount: 1 },
    { name: "panCardImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  registerSeller,
);

router.get(
  "/:sellerId/dashboard",
  authenticateUser,
  requireAuth,
  authorizeRoles("ADMIN", "SUPER_ADMIN"), // note: spread args, matching this file's actual signature
  getSellerDashboard,
);

// Endpoint to get the seller's status (registered, approved, rejected)
router.get(
  "/:sellerId/seller-status",
  authenticateUser,
  requireAuth,
  getSellerStatus,
);

// Endpoint to get the seller's vehicles
router.get("/:sellerId/vehicles", authenticateUser, requireAuth, getMyVehicles);

// Endpoint to delete a vehicle
router.delete(
  "/:sellerId/vehicles/:vehicleId",
  authenticateUser,
  requireAuth,
  deleteMyVehicle,
);

// Endpoint to get the seller's statistics
router.get("/me/stats", authenticateUser, requireAuth, getSellerStats);

// Endpoint to get the seller's sales performance
router.get(
  "/me/sales-performance",
  authenticateUser,
  requireAuth,
  getSalesPerformance,
);

// Endpoint to get the seller's inquiries
router.get("/me/inquiries", authenticateUser, requireAuth, getSellerInquiries);
router.get(
  "/inspection-requests",
  authenticateUser,
  requireAuth,
  getSellerInspections,
);
router.get(
  "/inspection-requests/:id",
  authenticateUser,
  requireAuth,
  getSellerInspectionById,
);

// Notification
router.get(
  "/seller-notifications",
  authenticateUser,
  requireAuth,
  getSellerNotifications,
);
router.patch(
  "/seller-notifications/:id/read",
  authenticateUser,
  requireAuth,
  markSellerNotificationRead,
);
router.patch(
  "/seller-notifications/read-all",
  authenticateUser,
  requireAuth,
  markAllSellerNotificationsRead,
);
router.delete("/:id", authenticateUser, requireAuth, deleteSellerNotification);

router.get("/me/profile", authenticateUser, requireAuth, getMyProfile);
router.patch(
  "/me/profile",
  authenticateUser,
  requireAuth,
  uploadFields([{ name: "profilePhoto", maxCount: 5 }]),
  updateMyProfile,
);
router.post(
  "/me/documents",
  authenticateUser,
  requireAuth,
  uploadFields([{ name: "documents", maxCount: 10 }]),
  uploadMyDocuments,
);
router.delete(
  "/me/documents/:documentId",
  authenticateUser,
  requireAuth,
  deleteMyDocument,
);
// Purchase Requests

router.get(
  "/purchase-requests",
  authenticateUser,
  requireAuth,
  getPurchaseRequestsForMe,
);
router.patch(
  "/purchase-requests/:id/accept",
  authenticateUser,
  requireAuth,
  acceptPurchaseRequest,
);
router.patch(
  "/purchase-requests/:id/reject",
  authenticateUser,
  requireAuth,
  rejectPurchaseRequest,
);
router.get(
  "/purchase-requests/:id",
  authenticateUser,
  requireAuth,
  getPurchaseRequestById,
);

export default router;
