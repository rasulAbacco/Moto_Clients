import express from "express";

import {
  adminLogin,
  adminRegister,
  getAllSellersForAdmin,
  getSellerDetailForAdmin,
  markSellerUnderReview,
  approveSellerProfile,
  verifySellerDocument,
  getVehiclesForVerification,
  createFieldInspectorAccount,
  updateFieldInspectorAccount,
  deleteFieldInspectorAccount,
  getAvailableInspectors,
  toggleFieldInspectorStatus,
  assignInspection,
  getAllInspectionsForAdmin,
  getInspectionDetailForAdmin,
  finalVerifyVehicle,
  getAdminNotifications,
  markAdminNotificationsRead,
} from "../../controllers/admin/admin.controller.js";

import { getAllUsers } from "../../controllers/admin/adminUserController.js";

import {
  getAllPayouts,
  markPartnerPaid,
} from "../../controllers/admin/adminPayout.controller.js";

import { getReferralRecords } from "../../controllers/admin/referralRecordsController.js";

import {
  getAllPartners,
  togglePartnerStatus,
} from "../../controllers/admin/adminPartner.controller.js";

import { getAdminDashboardSummary } from "../../controllers/admin/adminDashboard.controller.js";

import {
  exportCurrentCyclePayouts,
  confirmCurrentCyclePayout,
} from "../../controllers/admin/adminPayoutCycle.controller.js";

import {
  getAllPartnerKYC,
  updateKycStatus,
  getPartnerBankProofDocument,
  getPartnerPanDocument,
} from "../../controllers/admin/adminKyc.controller.js";

import { verifyAdmin } from "../../middleware/adminAuth.middleware.js";

const router = express.Router();

/* ======================================================
   PUBLIC ROUTES
====================================================== */

router.post("/register", adminRegister);
router.post("/login", adminLogin);

/* ======================================================
   PROTECTED ADMIN ROUTES
====================================================== */

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin",
    admin: req.admin,
  });
});

/* ===============================
   USERS
=============================== */
router.get("/users", verifyAdmin, getAllUsers);

/* ===============================
   PARTNERS
=============================== */
router.get("/partners", verifyAdmin, getAllPartners);
router.patch("/partners/:id/toggle", verifyAdmin, togglePartnerStatus);

/* ===============================
   PAYOUT PREVIEW (USER + PARTNER)
=============================== */
router.get("/payouts", verifyAdmin, getAllPayouts);

/* ===============================
   MANUAL SINGLE PAYOUT
=============================== */
router.post("/payouts/:id/mark-paid", verifyAdmin, markPartnerPaid);

/* ===============================
   CYCLE-BASED EXPORT
   GET /payouts/export-cycle?cycleStart=YYYY-MM-DD&cycleEnd=YYYY-MM-DD
=============================== */
router.get("/payouts/export-cycle", verifyAdmin, exportCurrentCyclePayouts);

/* ===============================
   CONFIRM CYCLE PAYMENT
   POST /payouts/confirm-cycle
   Body:
   {
     cycleStart,
     cycleEnd,
     transactionReference
   }
=============================== */
router.post("/payouts/confirm-cycle", verifyAdmin, confirmCurrentCyclePayout);

/* ===============================
   REFERRAL RECORDS
=============================== */
router.get("/referrals", verifyAdmin, getReferralRecords);

/* ===============================
   DASHBOARD
=============================== */
router.get("/dashboard-summary", verifyAdmin, getAdminDashboardSummary);

/* ===============================
   KYC MANAGEMENT
=============================== */
router.get("/partners/kyc", verifyAdmin, getAllPartnerKYC);
router.put("/partners/kyc/:id", verifyAdmin, updateKycStatus);
router.get("/partners/kyc/:id/pan", verifyAdmin, getPartnerPanDocument);
router.get(
  "/partners/kyc/:id/bank-proof",
  verifyAdmin,
  getPartnerBankProofDocument,
);

// =============================Manage Seller and Inspection=========================
router.get("/sellers", verifyAdmin, getAllSellersForAdmin);
router.get("/sellers/:sellerId", verifyAdmin, getSellerDetailForAdmin);
router.patch(
  "/sellers/:sellerId/under-review",
  verifyAdmin,
  markSellerUnderReview,
);
router.patch("/sellers/:sellerId/approve", verifyAdmin, approveSellerProfile);
router.patch(
  "/seller-documents/:documentId/verify",
  verifyAdmin,
  verifySellerDocument,
);
router.get("/inspections", verifyAdmin, getAllInspectionsForAdmin);
router.get("/inspections/:id", verifyAdmin, getInspectionDetailForAdmin);
router.get("/vehicles/pending", verifyAdmin, getVehiclesForVerification);
router.post("/inspectors", verifyAdmin, createFieldInspectorAccount);
router.get("/inspectors", verifyAdmin, getAvailableInspectors);
router.put("/inspectors/:id", verifyAdmin, updateFieldInspectorAccount);
router.patch("/inspectors/:id/toggle", verifyAdmin, toggleFieldInspectorStatus);
router.delete("/inspectors/:id", verifyAdmin, deleteFieldInspectorAccount);
router.post("/inspections/assign", verifyAdmin, assignInspection);
router.get("/inspections", verifyAdmin, getAllInspectionsForAdmin);
router.get("/inspections/:id", verifyAdmin, getInspectionDetailForAdmin);
router.patch("/inspections/:id/verify", verifyAdmin, finalVerifyVehicle);
router.get("/notifications", verifyAdmin, getAdminNotifications);
router.patch(
  "/notifications/read-all",
  verifyAdmin,
  markAdminNotificationsRead,
);

export default router;
