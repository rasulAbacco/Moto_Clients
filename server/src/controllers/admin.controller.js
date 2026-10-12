import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



// GET /api/admin/sellers/pending — the admin's "notification queue"
export const getPendingSellers = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const pending = await prisma.sellerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            createdAt: true,
          },
        },
        documents: true,
      },
      orderBy: { submittedAt: "asc" }, // oldest first = FIFO queue
    });

    res.json({
      success: true,
      count: pending.length,
      sellers: pending.map(toSellerProfileDTO),
    });
  } catch (error) {
    console.error("getPendingSellers error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load pending sellers" });
  }
};

// GET /api/admin/sellers/notifications-count — badge count for the bell icon
export const getPendingSellerCount = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const count = await prisma.sellerProfile.count({
      where: { verificationStatus: "PENDING" },
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error("getPendingSellerCount error:", error);
    res.status(500).json({ success: false, message: "Failed to load count" });
  }
};

// GET /api/admin/sellers/:sellerProfileId — full detail for review
export const getSellerRegistrationDetail = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { id: req.params.sellerProfileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            createdAt: true,
          },
        },
        documents: true,
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller registration not found" });
    }

    res.json({ success: true, seller: toSellerProfileDTO(profile) });
  } catch (error) {
    console.error("getSellerRegistrationDetail error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load registration" });
  }
};

// PATCH /api/admin/sellers/:sellerProfileId/approve
export const approveSeller = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { sellerProfileId } = req.params;

    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller registration not found" });
    }
    if (profile.verificationStatus === "APPROVED") {
      return res
        .status(409)
        .json({ success: false, message: "Already approved" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.sellerProfile.update({
        where: { id: sellerProfileId },
        data: {
          verificationStatus: "APPROVED",
          reviewedAt: new Date(),
          rejectReason: null,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: profile.userId,
          action: "seller.registration_approved",
          entityType: "SellerProfile",
          entityId: sellerProfileId,
          metadata: { reviewedBy: req.user.id },
        },
      });

      return result;
    });

    // TODO: send push/email/SMS to seller here if you have that wired up

    res.json({
      success: true,
      message: "Seller approved",
      sellerProfile: toSellerProfileDTO(updated),
    });
  } catch (error) {
    console.error("approveSeller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve seller" });
  }
};

// PATCH /api/admin/sellers/:sellerProfileId/reject
export const rejectSeller = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const { sellerProfileId } = req.params;
    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller registration not found" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.sellerProfile.update({
        where: { id: sellerProfileId },
        data: {
          verificationStatus: "REJECTED",
          reviewedAt: new Date(),
          rejectReason: parsed.data.reason,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: profile.userId,
          action: "seller.registration_rejected",
          entityType: "SellerProfile",
          entityId: sellerProfileId,
          metadata: { reviewedBy: req.user.id, reason: parsed.data.reason },
        },
      });

      return result;
    });

    res.json({
      success: true,
      message: "Seller rejected",
      sellerProfile: toSellerProfileDTO(updated),
    });
  } catch (error) {
    console.error("rejectSeller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject seller" });
  }
};
