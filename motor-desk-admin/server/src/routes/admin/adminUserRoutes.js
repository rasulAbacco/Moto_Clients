// routes/adminRoutes.js

import express from "express";
import { getAllUsers } from "../controllers/adminUserController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/users", verifyAdmin, getAllUsers);

export default router;
