import express from "express";
import * as vehicleController from "../controllers/vehicle.controller.js";
import {
  getMyVehicles,
  deleteMyVehicle,
} from "../controllers/sellerController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { uploadFields } from "../middleware/upload.middleware.js";

const router = express.Router();

// Accepts "images" (multiple) + "rcFront" + "insuranceDocument" (single each) in one multipart request
const vehicleUpload = uploadFields([
  { name: "images", maxCount: 15 },
  { name: "rcFront", maxCount: 1 },
  { name: "insuranceDocument", maxCount: 1 },
]);

router.get("/", vehicleController.getAllVehicles);
router.get("/homepage", vehicleController.getHomepageVehicles);
router.get("/featured", vehicleController.getFeaturedVehicles);
router.get("/search", vehicleController.searchVehicle);
router.get("/filter", vehicleController.filterVehicle);

router.get(
  "/my/listings",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  getMyVehicles,
);
router.delete(
  "/my/listings/:id",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  deleteMyVehicle,
);

router.get("/:id", vehicleController.getVehicleById);

router.post(
  "/",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleUpload,
  vehicleController.createVehicle,
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleUpload,
  vehicleController.updateVehicle,
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.deleteVehicle,
);

router.patch(
  "/:id/approve",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.approveVehicle,
);
router.patch(
  "/:id/reject",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.rejectVehicle,
);
router.patch(
  "/:id/sold",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.soldVehicle,
);
router.patch(
  "/:id/pending",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.pendingVehicle,
);

export default router;
