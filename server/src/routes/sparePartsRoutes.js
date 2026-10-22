// server/src/routes/sparePartsRoutes.js
//
// Spare parts (MotorDesk store) for the Motor Konnect app. Mounted at /api/spare-parts:
//   GET   /products?vehicle=car|bike&vendor=<id>      browse (public)
//   GET   /vendors?vehicle=car|bike                   shops (public)
//   POST  /cart/validate                              live price / stock / shop options (public)
//   GET   /checkout-profile                           prefill checkout (login)
//   POST  /orders                                     place order (login)
//   GET   /orders, /orders/:id                        my orders (login)
//   PATCH /orders/:id/cancel                          cancel (login)
//   GET   /orders/:id/upi, POST /orders/:id/upi        pay shop by UPI + submit UTR (login)
//
// Browsing is public on purpose; the store login and partner key stay on this server.
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getSpareParts,
  getSparePartVendors,
} from "../controllers/sparePartsController.js";
import {
  cancelOrder,
  checkoutProfile,
  myOrders,
  orderDetail,
  placeOrder,
  submitUpi,
  upiDetails,
  validateCart,
} from "../controllers/sparePartsOrders.controller.js";

const router = express.Router();

router.get("/products", getSpareParts);
router.get("/vendors", getSparePartVendors);
router.post("/cart/validate", validateCart);

router.get("/checkout-profile", authenticate, checkoutProfile);
router.post("/orders", authenticate, placeOrder);
router.get("/orders", authenticate, myOrders);
router.get("/orders/:id", authenticate, orderDetail);
router.patch("/orders/:id/cancel", authenticate, cancelOrder);
router.get("/orders/:id/upi", authenticate, upiDetails);
router.post("/orders/:id/upi", authenticate, submitUpi);

export default router;
