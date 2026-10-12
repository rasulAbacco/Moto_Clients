import express from "express";
import { getBrands, getModels } from "../controllers/vehicle.controller.js";
import * as vehicleController from "../controllers/vehicle.controller.js";
import { uploadFields } from "../middleware/upload.middleware.js";

const router = express.Router();
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

router.get("/brands", getBrands);
router.get("/models/:brandId", getModels);

//MY=====================================================
// Accepts "images" (multiple) + "rcFront" + "insuranceDocument" (single each) in one multipart request
const vehicleUpload = uploadFields([
  { name: "images", maxCount: 15 },
  { name: "rcFront", maxCount: 1 },
  { name: "insuranceDocument", maxCount: 1 },
  { name: "documents", maxCount: 10 },
]);

router.get("/", vehicleController.getAllVehicles);
router.get("/homepage", vehicleController.getHomepageVehicles);
router.get("/featured", vehicleController.getFeaturedVehicles);
router.get("/search", vehicleController.searchVehicle);
router.get("/filter", vehicleController.filterVehicle);
router.get(
  "/admin/pending",
  authenticateUser,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  vehicleController.getPendingVehicles,
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

router.delete(
  "/:id/images",
  authenticateUser,
  authorizeRoles("SELLER", "ADMIN", "SUPER_ADMIN"),
  vehicleController.deleteVehicleImage,
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
