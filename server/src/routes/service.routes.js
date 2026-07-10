import express from "express";
const router = express.Router();
import {
  getMainServices,
  getMainServiceById,
  getSubServiceById,
  searchServices,
} from "../controllers/service.controller.js";

// ⚠️ FIX: this route existed in the controller but was never registered,
// so GET /api/services/search 404'd. It MUST come before "/:id" —
// otherwise Express treats "search" as an :id param and routes it there
// instead (getMainServiceById would run with id="search").
router.get("/search", searchServices);

router.get("/", getMainServices);
router.get("/:id", getMainServiceById);
router.get("/sub-services/:id", getSubServiceById);

export default router;
