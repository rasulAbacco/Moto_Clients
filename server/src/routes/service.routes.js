import express from "express";
const router = express.Router();
import {
  getMainServices,
  getMainServiceById,
  getSubServiceById,
} from "../controllers/service.controller.js";

router.get("/", getMainServices);
router.get("/:id", getMainServiceById);
router.get("/sub-services/:id", getSubServiceById);

export default router;
