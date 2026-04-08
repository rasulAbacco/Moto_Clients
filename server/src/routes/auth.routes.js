// auth.routes.js
import express from "express";
import { getProfile, updateProfile, addVehicle, getVehicles, updateVehicle, 
     getVehicleById, deleteVehicle, addGuestVehicle, uploadProfileImage, getProfileImage } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const router = express.Router();

// Public
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected — profile
router.get("/me", authenticate, getProfile);
router.get("/profile-image", authenticate, getProfileImage);
router.put("/me", authenticate, updateProfile);
router.post("/guest/vehicles", addGuestVehicle);

// Protected — vehicles
router.post("/vehicles", authenticate, addVehicle);
router.get("/vehicles", authenticate, getVehicles);
router.get("/vehicles/:id", authenticate, getVehicleById);
router.put("/vehicles/:id", authenticate, updateVehicle);
router.delete("/vehicles/:id", authenticate, deleteVehicle); // ✅ ADD THIS
router.put(
  "/profile-image",
  authenticate,
  upload.single("image"),
  uploadProfileImage
);

export default router;
