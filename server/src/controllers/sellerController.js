import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import CloudinaryService from "../config/CloudinaryService.js";
const prisma = new PrismaClient();

// Seller Profile Controller
export const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        documents: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });
    }
    res.json({
      success: true,
      message: "Profile fetched",
      data: toSellerProfileDTO(profile),
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

const profileUpdateSchema = z.object({
  ownerName: z.string().min(2).optional(),
  businessName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().optional(),
  website: z.string().optional().nullable(),
  phone: z.string().optional(),
  sellerType: z.string().optional().nullable(),
});

export const updateMyProfile = async (req, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const { phone, ...profileFields } = parsed.data;

    const profilePhotoFile = getFile(req, "profilePhoto");
    let profilePhotoUrl;
    if (profilePhotoFile) {
      const result = await CloudinaryService.uploadBuffer(
        profilePhotoFile.buffer,
        "vehiclehub/sellers/profile",
      );
      profilePhotoUrl = result.secure_url;
    }

    const updated = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...profileFields,
        ...(profilePhotoUrl ? { profilePhoto: profilePhotoUrl } : {}),
      },
      include: {
        documents: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });

    if (phone) {
      await prisma.user.update({ where: { id: req.user.id }, data: { phone } });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: toSellerProfileDTO(updated),
    });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

// ============================================================
// Validation schemas
// ============================================================

const sellerRegistrationSchema = z.object({
  sellerType: z.enum(["Individual", "Dealer"]),
  ownerName: z.string().min(2, "Owner name is required"),
  businessName: z.string().optional().nullable(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(4, "Pincode is required"),
  gstNumber: z.string().optional().nullable(),
  panNumber: z.string().min(1, "PAN number is required"),
  yearsInBusiness: z.union([z.string(), z.number()]).optional().nullable(),
  website: z.string().optional().nullable(),
  bankAccountHolder: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIFSC: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const rejectSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required"),
});

// ============================================================
// Helpers
// ============================================================

const toSellerProfileDTO = (profile) => ({
  id: profile.id,
  userId: profile.userId,
  ownerName: profile.ownerName,
  businessName: profile.businessName,
  sellerType: profile.sellerType,
  email: profile.user?.email,
  phone: profile.user?.phone,
  address: profile.address,
  city: profile.city,
  state: profile.state,
  pincode: profile.pincode,
  country: profile.country,
  gstNumber: profile.gstNumber,
  panNumber: profile.panNumber,
  yearsInBusiness: profile.yearsInBusiness,
  website: profile.website,
  bankAccountHolder: profile.bankAccountHolder,
  bankAccountNumber: profile.bankAccountNumber,
  bankIFSC: profile.bankIFSC,
  bankName: profile.bankName,
  description: profile.description,
  profilePhoto: profile.profilePhoto,
  shopLogo: profile.shopLogo,
  verificationStatus: profile.verificationStatus,
  rejectReason: profile.rejectReason,
  submittedAt: profile.submittedAt,
  reviewedAt: profile.reviewedAt,
  isElite: profile.isElite,
  rating: profile.rating,
  totalReviews: profile.totalReviews,
  documents: profile.documents,
});

// Files can arrive either as multer's `req.files` (multipart) or already-uploaded URLs in `req.body`
const getFile = (req, fieldName) => req.files?.[fieldName]?.[0] || null;

// POST /api/sellers/me/documents — seller uploads one or more verification documents
export const uploadMyDocuments = async (req, res) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });
    }

    const files = req.files?.documents || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No documents provided" });
    }

    const docType = String(
      req.body.documentType || "OWNERSHIP_PROOF",
    ).toUpperCase();

    const created = [];
    for (const file of files) {
      const result = await CloudinaryService.uploadBuffer(
        file.buffer,
        "vehiclehub/sellers/documents",
      );
      const doc = await prisma.sellerDocument.create({
        data: {
          sellerProfileId: profile.id,
          type: docType,
          fileUrl: result.secure_url,
          status: "PENDING",
        },
      });
      created.push(doc);
    }

    res.json({
      success: true,
      message: "Document(s) uploaded successfully",
      data: created,
    });
  } catch (error) {
    console.error("uploadMyDocuments error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload document(s)" });
  }
};

// DELETE /api/sellers/me/documents/:documentId
export const deleteMyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });
    }

    const document = await prisma.sellerDocument.findUnique({
      where: { id: documentId },
    });
    if (!document || document.sellerProfileId !== profile.id) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    await prisma.sellerDocument.delete({ where: { id: documentId } });
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("deleteMyDocument error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete document" });
  }
};

// ============================================================
// POST /api/sellers/register
// Called by SellerRegistration.jsx on submit. Creates the SellerProfile

export const registerSeller = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required before registering as a seller.",
      });
    }

    const parsed = sellerRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const data = parsed.data;

    const existing = await prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return res.status(409).json({
        message: "A seller registration already exists for this account.",
        status: existing.verificationStatus,
      });
    }

    // inside registerSeller, before the transaction:
    const profilePhotoFile = getFile(req, "profilePhoto");
    const shopLogoFile = getFile(req, "shopLogo");
    const panCardFile = getFile(req, "panCardImage");
    const gstCertFile = getFile(req, "gstCertificate");

    const [profilePhotoRes, shopLogoRes, panCardRes, gstCertRes] =
      await Promise.all([
        profilePhotoFile
          ? CloudinaryService.uploadBuffer(
              profilePhotoFile.buffer,
              "vehiclehub/sellers/profile",
            )
          : null,
        shopLogoFile
          ? CloudinaryService.uploadBuffer(
              shopLogoFile.buffer,
              "vehiclehub/sellers/logo",
            )
          : null,
        panCardFile
          ? CloudinaryService.uploadBuffer(
              panCardFile.buffer,
              "vehiclehub/sellers/pan",
            )
          : null,
        gstCertFile
          ? CloudinaryService.uploadBuffer(
              gstCertFile.buffer,
              "vehiclehub/sellers/gst",
            )
          : null,
      ]);

    const profilePhotoUrl = profilePhotoRes?.secure_url || null;
    const shopLogoUrl = shopLogoRes?.secure_url || null;
    const panCardUrl = panCardRes?.secure_url || null;
    const gstCertUrl = gstCertRes?.secure_url || null;

    // Create profile and related records (sequentially). We avoid a transactional client here
    // because some Prisma transaction clients may not expose the same model delegates in certain envs.
    const profile = await prisma.sellerProfile.create({
      data: {
        userId,
        sellerType: data.sellerType === "Dealer" ? "DEALER" : "INDIVIDUAL",
        ownerName: data.ownerName,
        businessName: data.businessName || null,
        description: data.description || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gstNumber: data.gstNumber || null,
        panNumber: data.panNumber,
        yearsInBusiness: data.yearsInBusiness
          ? Number(data.yearsInBusiness)
          : null,
        website: data.website || null,
        bankAccountHolder: data.bankAccountHolder || null,
        bankAccountNumber: data.bankAccountNumber || null,
        bankIFSC: data.bankIFSC || null,
        bankName: data.bankName || null,
        profilePhoto: profilePhotoUrl,
        shopLogo: shopLogoUrl,
        verificationStatus: "PENDING",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: "SELLER", fullName: data.ownerName, phone: data.phone },
    });

    const docsToCreate = [];
    if (panCardUrl)
      docsToCreate.push({
        sellerProfileId: profile.id,
        type: "PAN_CARD",
        fileUrl: panCardUrl,
      });
    if (gstCertUrl)
      docsToCreate.push({
        sellerProfileId: profile.id,
        type: "GST_CERTIFICATE",
        fileUrl: gstCertUrl,
      });
    if (profilePhotoUrl)
      docsToCreate.push({
        sellerProfileId: profile.id,
        type: "PROFILE_PHOTO",
        fileUrl: profilePhotoUrl,
      });
    if (shopLogoUrl)
      docsToCreate.push({
        sellerProfileId: profile.id,
        type: "SHOP_LOGO",
        fileUrl: shopLogoUrl,
      });

    if (docsToCreate.length) {
      await prisma.sellerDocument.createMany({ data: docsToCreate });
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: "seller.registration_submitted",
        entityType: "SellerProfile",
        entityId: profile.id,
        metadata: {
          businessName: data.businessName,
          sellerType: data.sellerType,
        },
      },
    });

    const result = profile;

    return res.status(201).json({
      message:
        "Registration submitted for verification. You will be notified once reviewed.",
      sellerProfile: {
        id: result.id,
        verificationStatus: result.verificationStatus,
      },
    });
  } catch (error) {
    console.error("registerSeller error:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting your registration.",
    });
  }
};

// admin dashboard route to fetch seller dashboard data
export const getSellerDashboard = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { sellerId } = req.params;

    const seller = await prisma.user.findUnique({
      where: {
        id: sellerId,
      },
      include: {
        vehicles: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const totalVehicles = seller.vehicles.length;

    const availableVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "AVAILABLE",
    ).length;

    const pendingVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "PENDING",
    ).length;

    const soldVehicles = seller.vehicles.filter(
      (vehicle) => vehicle.status === "SOLD",
    ).length;

    res.json({
      success: true,
      seller: {
        id: seller.id,
        name: `${seller.firstName || ""} ${seller.lastName || ""}`.trim(),
        email: seller.email,
        phone: seller.phone,
        role: seller.role,
      },
      statistics: {
        totalVehicles,
        availableVehicles,
        pendingVehicles,
        soldVehicles,
      },
      vehicles: seller.vehicles,
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load seller dashboard",
    });
  }
};

export const getSellerStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sellerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSellerRegistered = !!user.sellerProfile;
    const isApproved = user.sellerProfile?.verificationStatus === "APPROVED";

    return res.json({
      success: true,
      isSellerRegistered,
      isApproved,
      sellerProfile: user.sellerProfile,
    });
  } catch (error) {
    console.error("SELLER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check seller status",
    });
  }
};

export const getMyVehicles = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const rawStatus = req.query.status;
    const allowedStatuses = [
      "DRAFT",
      "PENDING",
      "UNDER_VERIFICATION",
      "APPROVED",
      "REJECTED",
      "SOLD",
      "ARCHIVED",
    ];

    const normalizedStatus = rawStatus
      ? String(rawStatus).trim().toUpperCase()
      : null;

    if (normalizedStatus && !allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle status filter",
      });
    }

    const where = { sellerId: req.user.id };
    if (normalizedStatus) where.status = normalizedStatus;

    const vehicles = await prisma.vehicleListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      message: "Your vehicles fetched successfully",
      vehicles,
    });
  } catch (error) {
    console.error("getMyVehicles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch your vehicles" });
  }
};

export const deleteMyVehicle = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const { id } = req.params;

    const vehicle = await prisma.vehicleListing.findUnique({ where: { id } });
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    if (vehicle.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own listings",
      });
    }

    await prisma.vehicleListing.delete({ where: { id } });
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("deleteMyVehicle error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete vehicle" });
  }
};

export const getSellerStats = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const sellerId = req.user.id;

    const [
      total,
      pending,
      underVerification,
      approved,
      rejected,
      sold,
      draft,
      archived,
      soldAgg,
      pendingInquiries,
    ] = await Promise.all([
      prisma.vehicleListing.count({ where: { sellerId } }),
      prisma.vehicleListing.count({ where: { sellerId, status: "PENDING" } }),
      prisma.vehicleListing.count({
        where: { sellerId, status: "UNDER_VERIFICATION" },
      }),
      prisma.vehicleListing.count({ where: { sellerId, status: "APPROVED" } }),
      prisma.vehicleListing.count({ where: { sellerId, status: "REJECTED" } }),
      prisma.vehicleListing.count({ where: { sellerId, status: "SOLD" } }),
      prisma.vehicleListing.count({ where: { sellerId, status: "DRAFT" } }),
      prisma.vehicleListing.count({ where: { sellerId, status: "ARCHIVED" } }),
      prisma.vehicleListing.aggregate({
        where: { sellerId, status: "SOLD" },
        _sum: { soldPrice: true },
      }),
      prisma.vehicleInquiry.count({
        where: { vehicleListing: { sellerId }, status: "INTERESTED" },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        underVerification,
        approved,
        rejected,
        sold,
        draft,
        archived,
        totalRevenue: soldAgg._sum.soldPrice || 0,
        pendingInquiries,
      },
    });
  } catch (error) {
    console.error("getSellerStats error:", error);
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
};

// GET /api/sellers/me/sales-performance — weekly sold-vehicle counts + revenue for the last 8 weeks
export const getSalesPerformance = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const sellerId = req.user.id;
    const WEEKS = 8;

    const since = new Date();
    since.setDate(since.getDate() - WEEKS * 7);

    const soldVehicles = await prisma.vehicleListing.findMany({
      where: { sellerId, status: "SOLD", soldAt: { gte: since } },
      select: { soldAt: true, soldPrice: true, price: true },
    });

    const buckets = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      buckets.push({
        label: `Wk ${WEEKS - i}`,
        weekStart,
        weekEnd,
        sales: 0,
        revenue: 0,
      });
    }

    soldVehicles.forEach((v) => {
      if (!v.soldAt) return;
      const soldAt = new Date(v.soldAt);
      const bucket = buckets.find(
        (b) => soldAt >= b.weekStart && soldAt < b.weekEnd,
      );
      if (bucket) {
        bucket.sales += 1;
        bucket.revenue += v.soldPrice || v.price || 0;
      }
    });

    res.json({
      success: true,
      data: buckets.map(({ label, sales, revenue }) => ({
        label,
        sales,
        revenue,
      })),
    });
  } catch (error) {
    console.error("getSalesPerformance error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load sales performance" });
  }
};

// GET /api/sellers/me/inquiries — buyers currently interested (VehicleInquiry, status = INTERESTED)
export const getSellerInquiries = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const inquiries = await prisma.vehicleInquiry.findMany({
      where: {
        vehicleListing: { sellerId: req.user.id },
        status: "INTERESTED",
      },
      include: {
        vehicleListing: {
          select: { id: true, title: true, price: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ success: true, inquiries });
  } catch (error) {
    console.error("getSellerInquiries error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inquiries" });
  }
};

export const getSellerInspections = async (req, res) => {
  try {
    const inspections = await prisma.fieldInspection.findMany({
      where: { sellerId: req.user.id },
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            images: true,
          },
        },
        inspector: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: [{ scheduledDate: "desc" }, { assignedAt: "desc" }],
    });
    res.json({ success: true, data: inspections });
  } catch (error) {
    console.error("getSellerInspections error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspection requests" });
  }
};

export const getSellerInspectionById = async (req, res) => {
  try {
    const inspection = await prisma.fieldInspection.findFirst({
      where: { id: req.params.id, sellerId: req.user.id },
      include: {
        vehicleListing: true,
        inspector: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        assignedBy: { select: { id: true, fullName: true, email: true } },
        checklist: true,
        documents: true,
        vehicleChecks: true,
        photos: true,
        location: true,
      },
    });
    if (!inspection)
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    res.json({ success: true, data: inspection });
  } catch (error) {
    console.error("getSellerInspectionById error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspection details" });
  }
};

// Notification Controller
export const getSellerNotifications = async (req, res) => {
  try {
    const notifications = await prisma.sellerNotification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.sellerNotification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({
      success: true,
      message: "Notifications fetched",
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error("getSellerNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load notifications" });
  }
};

export const markSellerNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.sellerNotification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    const updated = await prisma.sellerNotification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true, message: "Marked read", data: updated });
  } catch (error) {
    console.error("markSellerNotificationRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

export const markAllSellerNotificationsRead = async (req, res) => {
  try {
    await prisma.sellerNotification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: "All marked read" });
  } catch (error) {
    console.error("markAllSellerNotificationsRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notifications" });
  }
};

export const deleteSellerNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.sellerNotification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    await prisma.sellerNotification.delete({ where: { id } });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("deleteSellerNotification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};

// Seller get inquiries (buyers interested in their vehicles)

export const getPurchaseRequestsForMe = async (req, res) => {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: { sellerId: req.user.id, status: "PENDING" },
      include: {
        vehicleListing: {
          select: { id: true, title: true, price: true, images: true },
        },
        buyer: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("getPurchaseRequestsForMe error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load purchase requests" });
  }
};

export const acceptPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: { vehicleListing: true },
    });
    if (!request || request.sellerId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase request not found" });
    }
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This request has already been handled",
      });
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.purchaseRequest.update({
        where: { id },
        data: { status: "ACCEPTED" },
      }),
      prisma.vehicleListing.update({
        where: { id: request.vehicleListingId },
        data: {
          status: "SOLD",
          soldToName: request.buyerName,
          soldToPhone: request.buyerPhone,
          soldToEmail: request.buyerEmail,
          soldPrice: request.offerPrice,
          soldAt: new Date(),
        },
      }),
      prisma.purchaseRequest.updateMany({
        where: {
          vehicleListingId: request.vehicleListingId,
          status: "PENDING",
          id: { not: id },
        },
        data: {
          status: "REJECTED",
          rejectReason: "Vehicle sold to another buyer",
        },
      }),
    ]);

    await prisma.buyerNotification.create({
      data: {
        userId: request.buyerId,
        title: "Purchase request accepted!",
        message: `Your offer for "${request.vehicleListing.title}" was accepted. The seller will contact you soon.`,
        type: "VEHICLE_SOLD",
        link: "/buyer/dashboard/orders",
      },
    });

    res.json({
      success: true,
      message: "Purchase accepted, vehicle marked sold",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("acceptPurchaseRequest error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept purchase request" });
  }
};

export const rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!request || request.sellerId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase request not found" });
    }
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectReason: reason || null },
    });

    await prisma.buyerNotification.create({
      data: {
        userId: request.buyerId,
        title: "Purchase request declined",
        message: reason || "The seller declined your purchase request.",
        type: "VEHICLE_REJECTED",
        link: "/buyer/dashboard/orders",
      },
    });

    res.json({ success: true, message: "Request rejected", data: updated });
  } catch (error) {
    console.error("rejectPurchaseRequest error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject request" });
  }
};

// get purchase request by ID for seller to view details
export const getPurchaseRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        vehicleListing: true,
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });
    if (!request || request.sellerId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase request not found" });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    console.error("getPurchaseRequestById error:", error);
    res.status(500).json({ success: false, message: "Failed to load request" });
  }
};
