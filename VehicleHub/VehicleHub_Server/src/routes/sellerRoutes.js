import { Router } from "express";
import multer from "multer";
import {
  registerSeller,
  getSellerDashboard,
  getSellerStatus,
} from "../controllers/sellerController.js";
import {
  authenticateUser,
  requireAuth,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = Router();
const upload = multer({ dest: "uploads/sellers/" });

router.post(
  "/register",
  authenticateUser, // attaches req.user if a valid token is present
  requireAuth, // blocks the request if req.user is still null
  upload.fields([
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

export default router;
