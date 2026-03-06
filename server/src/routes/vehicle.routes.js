import express from "express";
import { getBrands, getModels } from "../controllers/vehicle.controller.js";

const router = express.Router();

router.get("/brands", getBrands);
router.get("/models/:brandSlug", getModels);

export default router;
