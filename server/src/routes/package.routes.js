import express from "express";
import * as controller from "../controllers/package.controller.js";

const router = express.Router();

/**
 * @route   GET /api/packages
 * @desc    Get all active packages for app
 * @query   vehicleType=CAR | BIKE
 */
router.get("/", controller.getPackages);

export default router;
