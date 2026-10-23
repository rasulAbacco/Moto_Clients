import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    const userId = decoded.userId ?? decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive)
      return res.status(401).json({ message: "User not authorized" });

    req.user = user;

    next();
  } catch (err) {
    // Database problem, not a bad token — don't log the user out (401).
    console.error("authenticate:", err.message);
    return res
      .status(503)
      .json({ message: "Server is busy. Please try again in a moment." });
  }
};

//MY===================================================================
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // No token = guest user
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const userId = decoded.userId ?? decoded.id;

    if (!userId) {
      req.user = null;
      return next();
    }

    // Find user from database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // User doesn't exist or is blocked
    if (!user || user.isBlocked || !user.isActive) {
      req.user = null;
      return next();
    }

    // Attach authenticated user
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Invalid/expired token behaves as unauthenticated
    req.user = null;

    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export { authenticateUser, requireAuth, authorizeRoles };
