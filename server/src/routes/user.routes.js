//user,routes.js
import express from "express";
import { getCurrentUser, updateUser } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateUserSchema } from "../validations/user.validation.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);

router.put("/me", authenticate, validate(updateUserSchema), updateUser);

export default router;
