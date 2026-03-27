import express from "express";
import { getMarketplaceServices } from "../controllers/marketplace.controller.js";

const router = express.Router();

// GET: MainService → Sections → Services → garages
router.get("/services", getMarketplaceServices);

export default router;
