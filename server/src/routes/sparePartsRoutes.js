// server/src/routes/sparePartsRoutes.js
//
// Spare parts catalogue for the Motor Konnect app (Store tab).
// Mounted at /api/spare-parts in routes/index.js:
//   GET /api/spare-parts/products?vehicle=car|bike&vendor=<id>
//   GET /api/spare-parts/vendors?vehicle=car|bike
//
// Public on purpose: guests can browse the Store before logging in, and the
// controller already signs in to the MotorDesk store on the server side
// (SPARE_PARTS_LOGIN_EMAIL / SPARE_PARTS_LOGIN_PASSWORD in server/.env), so
// no store credentials ever reach the app. The global rate limiter in
// app.js (if any) still applies.
import express from "express";
import {
  getSpareParts,
  getSparePartVendors,
} from "../controllers/sparePartsController.js";

const router = express.Router();

router.get("/products", getSpareParts);
router.get("/vendors", getSparePartVendors);

export default router;
