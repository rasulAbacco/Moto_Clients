import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getBuyerNotifications = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    const [notifications, unreadCount] = await Promise.all([
      prisma.buyerNotification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.buyerNotification.count({ where: { ...where, isRead: false } }),
    ]);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error("getBuyerNotifications error:", error);
    res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
};

export const markBuyerNotificationRead = async (req, res) => {
  try {
    const notification = await prisma.buyerNotification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    const updated = await prisma.buyerNotification.update({ where: { id: notification.id }, data: { isRead: true } });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("markBuyerNotificationRead error:", error);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

export const markAllBuyerNotificationsRead = async (req, res) => {
  try {
    await prisma.buyerNotification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: "All notifications marked read" });
  } catch (error) {
    console.error("markAllBuyerNotificationsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};

export const getBuyerStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [wishlistCount, inquiriesCount, purchasedCount] = await Promise.all([
      prisma.wishlist.count({ where: { userId } }),
      prisma.vehicleInquiry.count({ where: { buyerUserId: userId } }),
      prisma.vehicleInquiry.count({
        where: { buyerUserId: userId, status: "PURCHASED" },
      }),
    ]);
    res.json({
      success: true,
      data: { wishlistCount, inquiriesCount, purchasedCount },
    });
  } catch (error) {
    console.error("getBuyerStats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard stats" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { vehicleListing: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("getWishlist error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load wishlist" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { vehicleListingId } = req.body;
    if (!vehicleListingId)
      return res
        .status(400)
        .json({ success: false, message: "vehicleListingId is required" });

    const item = await prisma.wishlist.upsert({
      where: {
        userId_vehicleListingId: { userId: req.user.id, vehicleListingId },
      },
      update: {},
      create: { userId: req.user.id, vehicleListingId },
    });
    res
      .status(201)
      .json({ success: true, message: "Added to wishlist", data: item });
  } catch (error) {
    console.error("addToWishlist error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add to wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { vehicleListingId } = req.params;
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, vehicleListingId },
    });
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove from wishlist" });
  }
};

export const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.vehicleInquiry.findMany({
      where: { buyerUserId: req.user.id },
      include: { vehicleListing: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("getMyInquiries error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inquiries" });
  }
};

export const getBuyerProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("getBuyerProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

export const updateBuyerProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });
    res.json({ success: true, message: "Profile updated", data: updated });
  } catch (error) {
    console.error("updateBuyerProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

// ====================buyer purchased Requests====================================

export const createPurchaseRequest = async (req, res) => {
  try {
    const {
      vehicleListingId,
      offerPrice,
      buyerName,
      buyerPhone,
      buyerEmail,
      message,
    } = req.body;

    if (!vehicleListingId || !offerPrice || !buyerName || !buyerPhone) {
      return res.status(400).json({
        success: false,
        message:
          "vehicleListingId, offerPrice, buyerName, and buyerPhone are required",
      });
    }

    const vehicle = await prisma.vehicleListing.findUnique({
      where: { id: vehicleListingId },
    });
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    if (vehicle.status !== "APPROVED")
      return res.status(400).json({
        success: false,
        message: "This vehicle is not available for purchase",
      });
    if (vehicle.sellerId === req.user.id)
      return res.status(400).json({
        success: false,
        message: "You cannot purchase your own listing",
      });

    const existing = await prisma.purchaseRequest.findFirst({
      where: { vehicleListingId, buyerId: req.user.id, status: "PENDING" },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this vehicle",
      });
    }

    const request = await prisma.purchaseRequest.create({
      data: {
        vehicleListingId,
        buyerId: req.user.id,
        sellerId: vehicle.sellerId,
        offerPrice: Number(offerPrice),
        buyerName,
        buyerPhone,
        buyerEmail: buyerEmail || null,
        message: message || null,
      },
    });

    await prisma.sellerNotification.create({
      data: {
        userId: vehicle.sellerId,
        title: "New purchase request",
        message: `${buyerName} wants to buy "${vehicle.title}" for ₹${Number(offerPrice).toLocaleString("en-IN")}.`,
        type: "INQUIRY",
        link: "/seller/dashboard/customers",
      },
    });

    res.status(201).json({
      success: true,
      message: "Purchase request sent to the seller",
      data: request,
    });
  } catch (error) {
    console.error("createPurchaseRequest error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send purchase request" });
  }
};

export const getMyPurchaseRequests = async (req, res) => {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: { buyerId: req.user.id },
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("getMyPurchaseRequests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load your purchase requests",
    });
  }
};

export const cancelPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!request || request.buyerId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase request not found" });
    }
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    res.json({ success: true, message: "Request cancelled", data: updated });
  } catch (error) {
    console.error("cancelPurchaseRequest error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel request" });
  }
};
