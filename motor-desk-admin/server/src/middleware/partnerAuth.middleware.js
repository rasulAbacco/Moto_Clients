import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

export const verifyPartner = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 1. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. 🔒 Strict type check (Ensures Garage Users can't use Partner APIs)
    if (decoded.type !== "PARTNER") {
      return res
        .status(403)
        .json({ message: "Forbidden: Access restricted to partners" });
    }

    // 3. 🔍 Validate partner still exists & is active
    const partner = await prisma.referralPartner.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, isActive: true },
    });

    if (!partner) {
      return res.status(401).json({ message: "Partner account not found" });
    }

    if (!partner.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact support." });
    }

    // 4. ✅ ATTACH TO REQ.USER
    // We use req.user so the controller can find req.user.id
    req.user = partner;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
