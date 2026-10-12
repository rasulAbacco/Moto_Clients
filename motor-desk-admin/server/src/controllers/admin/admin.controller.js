//server/src/controllers/admin.controller.js
import {
  registerAdminService,
  loginAdminService,
} from "../../services/auth.service.js";

import externalPkg from "../../../../../server/node_modules/.prisma/client/index.js";
import { z } from "zod";
import bcrypt from "bcrypt";

const { PrismaClient } = externalPkg;
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.EXTERNAL_DATABASE_URL } },
});

/*
|--------------------------------------------------------------------------
| ADMIN REGISTER CONTROLLER
|--------------------------------------------------------------------------
*/
export const adminRegister = async (req, res) => {
  try {
    console.log("Admin register body:", req.body); // 👈 ADD THIS

    const result = await registerAdminService(req.body);

    console.log("Service result:", result); // 👈 ADD THIS

    res.status(201).json(result);
  } catch (error) {
    console.error("Admin register error:", error); // 👈 ADD THIS
    res.status(400).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN CONTROLLER
|--------------------------------------------------------------------------
*/
export const adminLogin = async (req, res) => {
  try {
    const result = await loginAdminService(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//===============================================================================

// ---------------------------------------------
// 1. Sellers — full list + detail, move to UNDER_REVIEW
// ---------------------------------------------

export const getAllSellersForAdmin = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.verificationStatus = status;
    if (search) {
      where.OR = [
        { ownerName: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.sellerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              createdAt: true,
              _count: { select: { vehicleListings: true } },
            },
          },
          documents: true,
        },
        orderBy: { submittedAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.sellerProfile.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Sellers fetched",
      data: {
        sellers: sellers.map((seller) => ({
          ...seller,
          _count: { vehicleListings: seller.user._count.vehicleListings },
        })),
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("getAllSellersForAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to load sellers" });
  }
};

export const getSellerDetailForAdmin = async (req, res) => {
  try {
    const { sellerId } = req.params; // SellerProfile.id

    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
        documents: true,
      },
    });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const vehicleListings = await prisma.vehicleListing.findMany({
      where: { sellerId: profile.userId },
      orderBy: { createdAt: "desc" },
      include: {
        fieldInspections: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          include: {
            inspector: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Seller detail fetched",
      data: { profile, vehicleListings },
    });
  } catch (error) {
    console.error("getSellerDetailForAdmin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load seller detail" });
  }
};

export const markSellerUnderReview = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
    });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { verificationStatus: "UNDER_REVIEW" },
    });

    await prisma.sellerNotification.create({
      data: {
        userId: profile.userId,
        title: "Your registration is under review",
        message:
          "Our team is currently reviewing your seller registration and documents.",
        type: "UNDER_REVIEW",
        link: "/seller/dashboard/business-profile",
      },
    });

    res.json({
      success: true,
      message: "Seller marked under review",
      data: updated,
    });
  } catch (error) {
    console.error("markSellerUnderReview error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update seller status" });
  }
};

export const approveSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const profile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
    });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const updated = await prisma.$transaction(async (tx) => {
      const approvedProfile = await tx.sellerProfile.update({
        where: { id: sellerId },
        data: { verificationStatus: "APPROVED" },
      });

      await tx.sellerNotification.create({
        data: {
          userId: profile.userId,
          title: "Seller profile approved",
          message:
            "Your seller profile and submitted documents have been approved.",
          type: "PROFILE_APPROVED",
          link: "/seller/dashboard/business-profile",
        },
      });

      return approvedProfile;
    });

    res.json({
      success: true,
      message: "Seller profile approved",
      data: updated,
    });
  } catch (error) {
    console.error("approveSellerProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve seller profile" });
  }
};

const verifySellerDocumentSchema = z.object({
  decision: z.enum(["VERIFY", "REJECT"]),
  reason: z.string().trim().max(2000).optional(),
});

export const verifySellerDocument = async (req, res) => {
  try {
    const parsed = verifySellerDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed" });
    }

    const { documentId } = req.params;
    const { decision, reason } = parsed.data;
    if (decision === "REJECT" && !reason) {
      return res
        .status(422)
        .json({ success: false, message: "Rejection reason is required" });
    }

    const document = await prisma.sellerDocument.findUnique({
      where: { id: documentId },
      include: { sellerProfile: true },
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Seller document not found" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDocument = await tx.sellerDocument.update({
        where: { id: documentId },
        data: {
          status: decision === "VERIFY" ? "VERIFIED" : "REJECTED",
          verifiedAt: decision === "VERIFY" ? new Date() : null,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: document.sellerProfile.userId,
          action:
            decision === "VERIFY"
              ? "seller_document.verified"
              : "seller_document.rejected",
          entityType: "SellerDocument",
          entityId: documentId,
          metadata: { reason: reason || null, documentType: document.type },
        },
      });

      await tx.sellerNotification.create({
        data: {
          userId: document.sellerProfile.userId,
          title:
            decision === "VERIFY"
              ? "Seller document verified"
              : "Seller document rejected",
          message:
            decision === "VERIFY"
              ? `Your ${document.type} document has been verified.`
              : `Your ${document.type} document was rejected. Reason: ${reason}`,
          type:
            decision === "VERIFY" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED",
          link: "/seller/dashboard/business-profile",
        },
      });

      return updatedDocument;
    });

    res.json({
      success: true,
      message: "Seller document updated",
      data: updated,
    });
  } catch (error) {
    console.error("verifySellerDocument error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update seller document" });
  }
};

// ---------------------------------------------
// 2. Vehicles awaiting verification (pending listings)
// ---------------------------------------------

export const getVehiclesForVerification = async (req, res) => {
  try {
    const { search, status = "PENDING", page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status === "ALL" ? {} : { status };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicleListing.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              sellerProfile: { include: { documents: true } },
            },
          },
          fieldInspections: {
            orderBy: { assignedAt: "desc" },
            take: 1,
            include: { inspector: { select: { id: true, fullName: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.vehicleListing.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Vehicles fetched",
      data: { vehicles, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getVehiclesForVerification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load vehicles" });
  }
};

// ---------------------------------------------
// 3. Field Inspector account creation (so they show in the assign dropdown)
// ---------------------------------------------

const createInspectorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateInspectorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * CREATE FIELD INSPECTOR
 */
export const createFieldInspectorAccount = async (req, res) => {
  try {
    const parsed = createInspectorSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullName, email, phone, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const inspector = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: "FIELD_INSPECTOR",
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Field inspector account created successfully",
      data: inspector,
    });
  } catch (error) {
    console.error("createFieldInspectorAccount error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create inspector account",
    });
  }
};
/**
 * UPDATE FIELD INSPECTOR
 */
export const updateFieldInspectorAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const parsed = updateInspectorSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullName, email, phone, password } = parsed.data;

    // Check inspector exists
    const inspector = await prisma.user.findFirst({
      where: {
        id,
        role: "FIELD_INSPECTOR",
      },
    });

    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: "Field inspector not found",
      });
    }

    // Check duplicate email/phone
    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another user already uses this email or phone",
      });
    }

    const updateData = {
      fullName,
      email,
      phone,
    };

    // Password is optional during edit
    // Empty password = keep existing password
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedInspector = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Field inspector updated successfully",
      data: updatedInspector,
    });
  } catch (error) {
    console.error("updateFieldInspectorAccount error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inspector",
    });
  }
};
/**
 * DELETE FIELD INSPECTOR PERMANENTLY
 */
export const deleteFieldInspectorAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check inspector exists
    const inspector = await prisma.user.findFirst({
      where: {
        id,
        role: "FIELD_INSPECTOR",
      },
    });

    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: "Field inspector not found",
      });
    }

    // Permanent delete
    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Field inspector permanently deleted",
    });
  } catch (error) {
    console.error("deleteFieldInspectorAccount error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete inspector",
    });
  }
};

export const getAvailableInspectors = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const inspectors = await prisma.user.findMany({
      where: {
        role: "FIELD_INSPECTOR",
        ...(includeInactive ? {} : { isActive: true }),
        isBlocked: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        _count: {
          select: {
            inspectorInspections: {
              where: {
                status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
              },
            },
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    res.json({
      success: true,
      message: "Inspectors fetched",
      data: inspectors.map((i) => ({
        id: i.id,
        fullName: i.fullName,
        email: i.email,
        phone: i.phone,
        isActive: i.isActive,
        activeWorkload: i._count.inspectorInspections,
      })),
    });
  } catch (error) {
    console.error("getAvailableInspectors error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspectors" });
  }
};

export const toggleFieldInspectorStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const inspector = await prisma.user.findFirst({
      where: { id, role: "FIELD_INSPECTOR" },
      select: { id: true, isActive: true },
    });

    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: "Field inspector not found",
      });
    }

    const updatedInspector = await prisma.user.update({
      where: { id },
      data: { isActive: !inspector.isActive },
      select: { id: true, isActive: true },
    });

    return res.json({
      success: true,
      message: `Field inspector ${updatedInspector.isActive ? "activated" : "deactivated"}`,
      data: updatedInspector,
    });
  } catch (error) {
    console.error("toggleFieldInspectorStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inspector status",
    });
  }
};

// ---------------------------------------------
// 4. Assign inspection — dropdown-select flow
// ---------------------------------------------

const assignInspectionSchema = z.object({
  vehicleListingId: z.string().min(1),
  inspectorId: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  scheduledDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  description: z.string().trim().max(2000).optional().default(""),
});

export const assignInspection = async (req, res) => {
  try {
    const parsed = assignInspectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const {
      vehicleListingId,
      inspectorId,
      priority,
      scheduledDate,
      deadline,
      description,
    } = parsed.data;

    const vehicle = await prisma.vehicleListing.findUnique({
      where: { id: vehicleListingId },
    });
    if (!vehicle)
      return res
        .status(404)
        .json({ success: false, message: "Vehicle listing not found" });

    const inspector = await prisma.user.findUnique({
      where: { id: inspectorId },
    });
    if (!inspector || inspector.role !== "FIELD_INSPECTOR") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a valid field inspector",
      });
    }

    const existing = await prisma.fieldInspection.findFirst({
      where: {
        vehicleListingId,
        status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
      },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This vehicle already has an active inspection assigned",
      });
    }

    const inspection = await prisma.$transaction(async (tx) => {
      await tx.vehicleListing.update({
        where: { id: vehicleListingId },
        data: { status: "UNDER_VERIFICATION" },
      });

      const created = await tx.fieldInspection.create({
        data: {
          vehicleListingId,
          sellerId: vehicle.sellerId,
          inspectorId,
          priority,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          deadline: deadline ? new Date(deadline) : null,
          finalNotes: description || null,
          status: "ASSIGNED",
        },
      });

      // Notify the inspector
      await tx.inspectionNotification.create({
        data: {
          userId: inspectorId,
          inspectionId: created.id,
          title: "New inspection assigned",
          message: `You have been assigned to inspect "${vehicle.title}". Please review and accept the verification request.`,
        },
      });

      // Notify the seller
      await tx.sellerNotification.create({
        data: {
          userId: vehicle.sellerId,
          title: "Vehicle is under verification",
          message: `${inspector.fullName || "An inspector"} has been assigned to visit and verify your vehicle "${vehicle.title}".`,
          type: "UNDER_VERIFICATION",
          link: "/seller/dashboard/inspection-requests",
        },
      });

      return created;
    });

    res.status(201).json({
      success: true,
      message: "Inspection assigned successfully",
      data: inspection,
    });
  } catch (error) {
    console.error("assignInspection error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign inspection" });
  }
};

// ---------------------------------------------
// 5. Admin monitoring: see all inspections, filter by status
// ---------------------------------------------

export const getAllInspectionsForAdmin = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      inspectorId,
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (inspectorId) where.inspectorId = inspectorId;
    if (search) {
      where.OR = [
        { inspectionNo: { contains: search, mode: "insensitive" } },
        {
          vehicleListing: { title: { contains: search, mode: "insensitive" } },
        },
        { seller: { fullName: { contains: search, mode: "insensitive" } } },
        { inspector: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [inspections, total] = await Promise.all([
      prisma.fieldInspection.findMany({
        where,
        include: {
          vehicleListing: {
            select: {
              id: true,
              title: true,
              images: true,
              city: true,
              state: true,
            },
          },
          seller: { select: { id: true, fullName: true, phone: true } },
          inspector: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { assignedAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.fieldInspection.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Inspections fetched",
      data: { inspections, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getAllInspectionsForAdmin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspections" });
  }
};

export const getInspectionDetailForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.fieldInspection.findUnique({
      where: { id },
      include: {
        vehicleListing: true,
        seller: {
          include: {
            sellerProfile: { include: { documents: true } },
          },
        },
        inspector: {
          select: {
            id: true,
            fullName: true,
            lastName: true,
            phone: true,
            email: true,
            avatar: true,
            role: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
          },
        },
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
    res.json({
      success: true,
      message: "Inspection fetched",
      data: inspection,
    });
  } catch (error) {
    console.error("getInspectionDetailForAdmin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspection" });
  }
};

// ---------------------------------------------
// 6. Admin final verification — after reviewing the completed inspection report
// ---------------------------------------------

const finalVerifySchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "RECHECK"]),
  reason: z.string().optional(),
});

export const finalVerifyVehicle = async (req, res) => {
  try {
    const { id } = req.params; // FieldInspection id
    const parsed = finalVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const { decision, reason } = parsed.data;

    const inspection = await prisma.fieldInspection.findUnique({
      where: { id },
      include: { vehicleListing: true },
    });
    if (!inspection)
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    if (
      inspection.status !== "COMPLETED" &&
      inspection.status !== "RE_VERIFICATION" &&
      inspection.result !== "NEEDS_CORRECTION"
    ) {
      return res.status(400).json({
        success: false,
        message: "This inspection has not been submitted by the inspector yet",
      });
    }
    if (["REJECT", "RECHECK"].includes(decision) && !reason?.trim()) {
      return res
        .status(422)
        .json({ success: false, message: "A reason is required" });
    }

    const updatedVehicle = await prisma.$transaction(async (tx) => {
      if (decision === "RECHECK") {
        await tx.fieldInspection.update({
          where: { id },
          data: {
            status: "RE_VERIFICATION",
            result: "NEEDS_CORRECTION",
            correctionReason: reason,
            completedAt: null,
          },
        });

        await tx.vehicleListing.update({
          where: { id: inspection.vehicleListingId },
          data: { status: "UNDER_VERIFICATION" },
        });

        await tx.sellerNotification.create({
          data: {
            userId: inspection.sellerId,
            title: "Vehicle re-inspection requested",
            message: `A re-inspection is required for "${inspection.vehicleListing.title}". Reason: ${reason}`,
            type: "VEHICLE_RECHECK",
            link: "/seller/dashboard/inspection-requests",
          },
        });
        await tx.inspectionNotification.create({
          data: {
            userId: inspection.inspectorId,
            inspectionId: id,
            title: "Vehicle re-inspection requested",
            message: `Please re-inspect "${inspection.vehicleListing.title}". Admin reason: ${reason}`,
          },
        });
        return inspection.vehicleListing;
      }

      if (decision === "REJECT") {
        await tx.fieldInspection.update({
          where: { id },
          data: { status: "REJECTED" },
        });
      }

      const vehicle = await tx.vehicleListing.update({
        where: { id: inspection.vehicleListingId },
        data:
          decision === "APPROVE"
            ? { status: "APPROVED" }
            : { status: "REJECTED", rejectReason: reason },
      });

      await tx.sellerNotification.create({
        data: {
          userId: inspection.sellerId,
          title:
            decision === "APPROVE"
              ? "Vehicle approved after inspection"
              : "Vehicle rejected after inspection",
          message:
            decision === "APPROVE"
              ? `Your vehicle "${inspection.vehicleListing.title}" passed field verification and is now live for buyers.`
              : `Your vehicle "${inspection.vehicleListing.title}" was rejected after field verification. Reason: ${reason}`,
          type:
            decision === "APPROVE" ? "VEHICLE_APPROVED" : "VEHICLE_REJECTED",
          link: "/seller/dashboard/active-listings",
        },
      });

      await tx.inspectionNotification.create({
        data: {
          userId: inspection.inspectorId,
          inspectionId: id,
          title: "Admin finalized your inspection",
          message: `Admin ${decision === "APPROVE" ? "approved" : "rejected"} the vehicle based on your report.`,
        },
      });

      return vehicle;
    });

    res.json({
      success: true,
      message: "Final verification recorded",
      data: updatedVehicle,
    });
  } catch (error) {
    console.error("finalVerifyVehicle error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to finalize verification" });
  }
};

// ---------------------------------------------
// 7. Admin's own notification feed (accept + submit events land here)
// ---------------------------------------------

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await prisma.inspectionNotification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.inspectionNotification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({
      success: true,
      message: "Notifications fetched",
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error("getAdminNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load notifications" });
  }
};

export const markAdminNotificationsRead = async (req, res) => {
  try {
    await prisma.inspectionNotification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: "All notifications marked read" });
  } catch (error) {
    console.error("markAdminNotificationsRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notifications" });
  }
};
