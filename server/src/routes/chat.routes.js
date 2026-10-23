// POST /api/chat — Motor Konnect support chatbot (Gemini key stays on the server)
import express from "express";
import { chat } from "../controllers/chat.controller.js";

const router = express.Router();

// Simple per-IP limit so the AI key can't be abused: 20 messages / minute
const hits = new Map();
const limit = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= 20) {
    return res.status(429).json({
      success: false,
      message: "You're sending messages too fast. Please wait a moment.",
    });
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear();
  next();
};

router.post("/", limit, chat);

export default router;
