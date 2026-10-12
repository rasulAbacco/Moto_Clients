import express from "express";
import { verifyAdmin } from "../../middleware/adminAuth.middleware.js";
import {
  getSupportCustomer,
  searchSupportUsers,
  getCustomerInvoices,
  getCustomerPayments,
  getCustomerServices,
  refreshCustomerSnapshot,
  extendUserPlan,
  toggleUserCrmAccess,
  toggleUserStatus,
  getSupportLogs,
  getCustomerClients,
} from "../../controllers/admin/support.controller.js";

const router = express.Router();

/* ---------------- SNAPSHOT ---------------- */
router.get("/customer/:userId", verifyAdmin, getSupportCustomer);

/* ---------------- SEARCH ---------------- */
router.get("/search", verifyAdmin, searchSupportUsers);

/* ---------------- DRILL ---------------- */
router.get("/customer/:userId/invoices", verifyAdmin, getCustomerInvoices);
router.get("/customer/:userId/payments", verifyAdmin, getCustomerPayments);
router.get("/customer/:userId/services", verifyAdmin, getCustomerServices);

/* ---------------- ADMIN TOOLS ---------------- */
router.post("/customer/:userId/refresh", verifyAdmin, refreshCustomerSnapshot);
router.post("/customer/:userId/extend-plan", verifyAdmin, extendUserPlan);
router.post("/customer/:userId/toggle-crm", verifyAdmin, toggleUserCrmAccess);
router.post("/customer/:userId/toggle-status", verifyAdmin, toggleUserStatus);

/* ---------------- LOGS ---------------- */
router.get("/customer/:userId/logs", verifyAdmin, getSupportLogs);

router.get("/customer/:userId/clients", verifyAdmin, getCustomerClients);
export default router;
