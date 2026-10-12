import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import CloudinaryService from "../config/CloudinaryService.js";

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (fullName !== undefined && !fullName.trim()) {
      return res
        .status(422)
        .json({ success: false, message: "Full name cannot be empty" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This phone number is already in use",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(422).json({
        success: false,
        message: "Current and new password are required",
      });
    }
    if (newPassword.length < 8) {
      return res.status(422).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.password) {
      return res.status(400).json({
        success: false,
        message: "Password login is not enabled for this account",
      });
    }

    const bcrypt = (await import("bcrypt")).default;
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("changePassword error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};

// Extend getProfile to also return quick stats for the profile page
export const getProfile = async (req, res) => {
  try {
    const [user, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.$transaction([
        prisma.fieldInspection.count({ where: { inspectorId: req.user.id } }),
        prisma.fieldInspection.count({
          where: { inspectorId: req.user.id, status: "COMPLETED" },
        }),
        prisma.fieldInspection.count({
          where: { inspectorId: req.user.id, result: "VERIFIED" },
        }),
      ]),
    ]);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const [total, completed, verified] = stats;

    res.json({
      success: true,
      message: "Profile fetched",
      data: { ...user, stats: { total, completed, verified } },
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const inspectorId = req.user.id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      total,
      pending,
      todayCount,
      completed,
      verified,
      rejected,
      needsCorrection,
      overdue,
    ] = await Promise.all([
      prisma.fieldInspection.count({ where: { inspectorId } }),
      prisma.fieldInspection.count({
        where: { inspectorId, status: { in: ["ASSIGNED", "ACCEPTED"] } },
      }),
      prisma.fieldInspection.count({
        where: {
          inspectorId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.fieldInspection.count({
        where: { inspectorId, status: "COMPLETED" },
      }),
      prisma.fieldInspection.count({
        where: { inspectorId, result: "VERIFIED" },
      }),
      prisma.fieldInspection.count({
        where: { inspectorId, result: "REJECTED" },
      }),
      prisma.fieldInspection.count({
        where: { inspectorId, result: "NEEDS_CORRECTION" },
      }),
      prisma.fieldInspection.count({
        where: {
          inspectorId,
          status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
          deadline: { lt: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        total,
        pending,
        today: todayCount,
        completed,
        verified,
        rejected,
        needsCorrection,
        overdue,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard stats" });
  }
};

export const getTodaySchedule = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const inspections = await prisma.fieldInspection.findMany({
      where: { inspectorId, scheduledDate: { gte: todayStart, lte: todayEnd } },
      include: {
        vehicleListing: {
          select: { id: true, title: true, city: true, state: true },
        },
        seller: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    res.json({
      success: true,
      message: "Today's schedule fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getTodaySchedule error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load today's schedule" });
  }
};

export const getPendingInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const inspections = await prisma.fieldInspection.findMany({
      where: { inspectorId, status: { in: ["ASSIGNED", "ACCEPTED"] } },
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            images: true,
            registrationNumber: true,
            city: true,
            state: true,
          },
        },
        seller: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { assignedAt: "desc" },
      take: 10,
    });
    res.json({
      success: true,
      message: "Pending inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getPendingInspections error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load pending inspections" });
  }
};

export const getUpcomingInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const now = new Date();
    const inspections = await prisma.fieldInspection.findMany({
      where: {
        inspectorId,
        scheduledDate: { gt: now },
        status: { in: ["ASSIGNED", "ACCEPTED"] },
      },
      include: {
        vehicleListing: {
          select: { id: true, title: true, city: true, state: true },
        },
        seller: { select: { id: true, fullName: true } },
      },
      orderBy: { scheduledDate: "asc" },
      take: 5,
    });
    res.json({
      success: true,
      message: "Upcoming inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getUpcomingInspections error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load upcoming inspections" });
  }
};

export const getRecentCompleted = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const inspections = await prisma.fieldInspection.findMany({
      where: { inspectorId, status: "COMPLETED" },
      include: {
        vehicleListing: { select: { id: true, title: true } },
        seller: { select: { id: true, fullName: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    });
    res.json({
      success: true,
      message: "Recent completed inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getRecentCompleted error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load recent completed inspections",
    });
  }
};

//===============================

export const getMyInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const { search, status, priority, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { inspectorId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { inspectionNo: { contains: search, mode: "insensitive" } },
        {
          vehicleListing: { title: { contains: search, mode: "insensitive" } },
        },
        { seller: { fullName: { contains: search, mode: "insensitive" } } },
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
        },
        orderBy: { assignedAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.fieldInspection.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Inspections fetched successfully",
      data: { inspections, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getMyInspections error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspections" });
  }
};

export const getInProgressInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const inspections = await prisma.fieldInspection.findMany({
      where: { inspectorId, status: "IN_PROGRESS" },
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            images: true,
            registrationNumber: true,
            city: true,
            state: true,
          },
        },
        seller: { select: { id: true, fullName: true, phone: true } },
        checklist: true,
      },
      orderBy: { startedAt: "desc" },
    });
    res.json({
      success: true,
      message: "In-progress inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getInProgressInspections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load in-progress inspections",
    });
  }
};

export const getCompletedInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const { result } = req.query;
    const where = { inspectorId, status: "COMPLETED" };
    if (result) where.result = result;

    const inspections = await prisma.fieldInspection.findMany({
      where,
      include: {
        vehicleListing: { select: { id: true, title: true, images: true } },
        seller: { select: { id: true, fullName: true } },
      },
      orderBy: { completedAt: "desc" },
    });
    res.json({
      success: true,
      message: "Completed inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getCompletedInspections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load completed inspections",
    });
  }
};

export const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.fieldInspection.findUnique({
      where: { id },
      include: {
        vehicleListing: true,
        seller: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        inspector: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        assignedBy: { select: { id: true, fullName: true, email: true } },
        checklist: true,
        documents: true,
        vehicleChecks: true,
        photos: true,
        location: true,
      },
    });

    if (!inspection) {
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    }
    if (inspection.inspectorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this inspection",
      });
    }

    res.json({
      success: true,
      message: "Inspection fetched successfully",
      data: inspection,
    });
  } catch (error) {
    console.error("getInspectionById error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load inspection" });
  }
};

export const acceptInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.fieldInspection.findUnique({
      where: { id },
    });

    if (!inspection)
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    if (inspection.inspectorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this inspection",
      });
    }
    if (inspection.status !== "ASSIGNED") {
      return res.status(400).json({
        success: false,
        message: "Only assigned inspections can be accepted",
      });
    }

    const updated = await prisma.fieldInspection.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    if (inspection.assignedById) {
      await prisma.inspectionNotification.create({
        data: {
          userId: inspection.assignedById,
          inspectionId: id,
          title: "Inspection accepted",
          message: `Inspector accepted inspection ${inspection.inspectionNo}.`,
        },
      });
    }

    res.json({ success: true, message: "Inspection accepted", data: updated });
  } catch (error) {
    console.error("acceptInspection error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to accept inspection" });
  }
};

export const startInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.fieldInspection.findUnique({
      where: { id },
    });

    if (!inspection)
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    if (inspection.inspectorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this inspection",
      });
    }
    if (
      !["ASSIGNED", "ACCEPTED", "RE_VERIFICATION"].includes(inspection.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Inspection cannot be started from its current status",
      });
    }

    const updated = await prisma.fieldInspection.update({
      where: { id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });

    // Ensure a checklist row exists for this inspection
    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: {},
      create: { inspectionId: id },
    });

    res.json({ success: true, message: "Inspection started", data: updated });
  } catch (error) {
    console.error("startInspection error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to start inspection" });
  }
};

export const getReports = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const { search, result, dateFrom, dateTo } = req.query;

    const where = { inspectorId, status: "COMPLETED" };
    if (result) where.result = result;
    if (dateFrom || dateTo) {
      where.completedAt = {};
      if (dateFrom) where.completedAt.gte = new Date(dateFrom);
      if (dateTo) where.completedAt.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { inspectionNo: { contains: search, mode: "insensitive" } },
        {
          vehicleListing: { title: { contains: search, mode: "insensitive" } },
        },
        { seller: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const reports = await prisma.fieldInspection.findMany({
      where,
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            images: true,
            brand: true,
            model: true,
          },
        },
        seller: { select: { id: true, fullName: true } },
        photos: { select: { id: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    res.json({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    console.error("getReports error:", error);
    res.status(500).json({ success: false, message: "Failed to load reports" });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.fieldInspection.findUnique({
      where: { id },
      include: {
        vehicleListing: true,
        seller: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        inspector: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        checklist: true,
        documents: true,
        vehicleChecks: true,
        photos: true,
        location: true,
      },
    });

    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    if (report.inspectorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this report",
      });
    }

    res.json({
      success: true,
      message: "Report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("getReportById error:", error);
    res.status(500).json({ success: false, message: "Failed to load report" });
  }
};

// ---- Step-by-step verification updates ----

const ensureOwnership = async (id, inspectorId) => {
  const inspection = await prisma.fieldInspection.findUnique({ where: { id } });
  if (!inspection) return { error: 404, message: "Inspection not found" };
  if (inspection.inspectorId !== inspectorId)
    return { error: 403, message: "You are not assigned to this inspection" };
  return { inspection };
};

export const updateSellerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { checks = {}, notes, status } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: {
        sellerVerified: status === "VERIFIED",
        sellerNotes: notes || null,
      },
      create: {
        inspectionId: id,
        sellerVerified: status === "VERIFIED",
        sellerNotes: notes || null,
      },
    });

    res.json({ success: true, message: "Seller verification saved" });
  } catch (error) {
    console.error("updateSellerVerification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save seller verification" });
  }
};

export const updateDocumentVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents = [] } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    await prisma.$transaction(
      documents.map((doc) =>
        prisma.inspectionDocumentVerification.upsert({
          where: {
            inspectionId_documentType: {
              inspectionId: id,
              documentType: doc.documentType,
            },
          },
          update: {
            status: doc.status,
            remarks: doc.remarks || null,
            rejectionReason:
              doc.status === "REJECTED" ? doc.rejectionReason || null : null,
            documentNumber: doc.documentNumber || null,
            documentUrl: doc.documentUrl || undefined, // keep existing URL if not resent
            verifiedAt: doc.status === "VERIFIED" ? new Date() : null,
          },
          create: {
            inspectionId: id,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl || null,
            documentNumber: doc.documentNumber || null,
            status: doc.status || "PENDING",
            remarks: doc.remarks || null,
            rejectionReason:
              doc.status === "REJECTED" ? doc.rejectionReason || null : null,
            verifiedAt: doc.status === "VERIFIED" ? new Date() : null,
          },
        }),
      ),
    );

    const allVerified =
      documents.length === 0 ||
      documents.every((d) => d.status && d.status !== "PENDING");
    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: { documentsVerified: allVerified },
      create: { inspectionId: id, documentsVerified: allVerified },
    });

    res.json({ success: true, message: "Documents saved" });
  } catch (error) {
    console.error("updateDocumentVerification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save documents" });
  }
};

export const updateVehicleIdentity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      observedRegistrationNumber,
      observedVin,
      observedEngineNumber,
      registrationMatch,
      vinMatch,
      engineMatch,
      status,
      notes,
    } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    // Store as vehicle checks under category "Identity"
    const items = [
      {
        item: "Registration Number Match",
        status: registrationMatch ? "VERIFIED" : "FAILED",
        remarks: observedRegistrationNumber,
      },
      {
        item: "VIN/Chassis Number Match",
        status: vinMatch ? "VERIFIED" : "FAILED",
        remarks: observedVin,
      },
      {
        item: "Engine Number Match",
        status: engineMatch ? "VERIFIED" : "FAILED",
        remarks: observedEngineNumber,
      },
    ];

    await prisma.inspectionVehicleCheck.deleteMany({
      where: { inspectionId: id, category: "Identity" },
    });
    await prisma.inspectionVehicleCheck.createMany({
      data: items.map((it) => ({
        inspectionId: id,
        category: "Identity",
        ...it,
      })),
    });

    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: {
        vehicleIdentityVerified: true,
        identityNotes: notes || null,
      },
      create: {
        inspectionId: id,
        vehicleIdentityVerified: true,
        identityNotes: notes || null,
      },
    });

    res.json({ success: true, message: "Vehicle identity saved" });
  } catch (error) {
    console.error("updateVehicleIdentity error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save vehicle identity" });
  }
};

export const updateVehicleCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, items = [], notesField, notes } = req.body;
    // items: [{ item, condition, status, remarks }]

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    await prisma.inspectionVehicleCheck.deleteMany({
      where: { inspectionId: id, category },
    });
    if (items.length) {
      await prisma.inspectionVehicleCheck.createMany({
        data: items.map((it) => ({
          inspectionId: id,
          category,
          item: it.item,
          condition: it.condition || null,
          status: it.status || "PENDING",
          remarks: it.remarks || null,
        })),
      });
    }

    const checklistField = {
      Exterior: "exteriorVerified",
      Interior: "interiorVerified",
      Mechanical: "mechanicalVerified",
    }[category];
    const notesFieldName = {
      Exterior: "exteriorNotes",
      Interior: "interiorNotes",
      Mechanical: "mechanicalNotes",
    }[category];

    if (checklistField) {
      await prisma.inspectionChecklist.upsert({
        where: { inspectionId: id },
        update: {
          [checklistField]: true,
          ...(notesFieldName ? { [notesFieldName]: notes || null } : {}),
        },
        create: {
          inspectionId: id,
          [checklistField]: true,
          ...(notesFieldName ? { [notesFieldName]: notes || null } : {}),
        },
      });
    }

    res.json({ success: true, message: `${category} check saved` });
  } catch (error) {
    console.error("updateVehicleCheck error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save vehicle check" });
  }
};

export const updateTestDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, rating, notes, reasonIfSkipped } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    await prisma.inspectionVehicleCheck.deleteMany({
      where: { inspectionId: id, category: "TestDrive" },
    });
    await prisma.inspectionVehicleCheck.create({
      data: {
        inspectionId: id,
        category: "TestDrive",
        item: completed ? "Test Drive Completed" : "Test Drive Skipped",
        status: completed ? "VERIFIED" : "PENDING",
        remarks: completed
          ? `Rating: ${rating}/5. ${notes || ""}`
          : reasonIfSkipped || null,
      },
    });

    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: {
        testDriveCompleted: !!completed,
        testDriveNotes: notes || reasonIfSkipped || null,
      },
      create: {
        inspectionId: id,
        testDriveCompleted: !!completed,
        testDriveNotes: notes || reasonIfSkipped || null,
      },
    });

    res.json({ success: true, message: "Test drive saved" });
  } catch (error) {
    console.error("updateTestDrive error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save test drive" });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      actualAddress,
      actualLatitude,
      actualLongitude,
      locationMatched,
      vehiclePresent,
      sellerPresent,
      remarks,
    } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    const vehicle = await prisma.vehicleListing.findUnique({
      where: {
        id: (await prisma.fieldInspection.findUnique({ where: { id } }))
          .vehicleListingId,
      },
      select: { area: true, city: true, state: true, pincode: true },
    });
    const expectedAddress = [
      vehicle?.area,
      vehicle?.city,
      vehicle?.state,
      vehicle?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    await prisma.inspectionLocation.upsert({
      where: { inspectionId: id },
      update: {
        expectedAddress,
        actualAddress: actualAddress || null,
        actualLatitude: actualLatitude ?? null,
        actualLongitude: actualLongitude ?? null,
        locationMatched: !!locationMatched,
        vehiclePresent: !!vehiclePresent,
        sellerPresent: !!sellerPresent,
        remarks: remarks || null,
        capturedAt: new Date(),
      },
      create: {
        inspectionId: id,
        expectedAddress,
        actualAddress: actualAddress || null,
        actualLatitude: actualLatitude ?? null,
        actualLongitude: actualLongitude ?? null,
        locationMatched: !!locationMatched,
        vehiclePresent: !!vehiclePresent,
        sellerPresent: !!sellerPresent,
        remarks: remarks || null,
        capturedAt: new Date(),
      },
    });

    await prisma.inspectionChecklist.upsert({
      where: { inspectionId: id },
      update: {
        locationVerified: !!locationMatched,
        locationNotes: remarks || null,
      },
      create: {
        inspectionId: id,
        locationVerified: !!locationMatched,
        locationNotes: remarks || null,
      },
    });

    res.json({ success: true, message: "Location verification saved" });
  } catch (error) {
    console.error("updateLocation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save location" });
  }
};

export const uploadInspectionPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    const files = req.files?.photos || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No photos uploaded" });
    }

    const created = [];
    for (const file of files) {
      const result = await CloudinaryService.uploadBuffer(
        file.buffer,
        "vehiclehub/inspections",
      );
      const photo = await prisma.inspectionPhoto.create({
        data: {
          inspectionId: id,
          category: category || "Other",
          imageUrl: result.secure_url,
          uploadedAt: new Date(),
        },
      });
      created.push(photo);
    }

    const photoCount = await prisma.inspectionPhoto.count({
      where: { inspectionId: id },
    });
    if (photoCount > 0) {
      await prisma.inspectionChecklist.upsert({
        where: { inspectionId: id },
        update: { photosCompleted: true },
        create: { inspectionId: id, photosCompleted: true },
      });
    }

    res.json({ success: true, message: "Photos uploaded", data: created });
  } catch (error) {
    console.error("uploadInspectionPhoto error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload photos" });
  }
};

export const deleteInspectionPhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    await prisma.inspectionPhoto.delete({ where: { id: photoId } });
    res.json({ success: true, message: "Photo deleted" });
  } catch (error) {
    console.error("deleteInspectionPhoto error:", error);
    res.status(500).json({ success: false, message: "Failed to delete photo" });
  }
};

export const saveInspectionDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, message } = await ensureOwnership(id, req.user.id);
    if (error) return res.status(error).json({ success: false, message });

    res.json({ success: true, message: "Draft saved" });
  } catch (error) {
    console.error("saveInspectionDraft error:", error);
    res.status(500).json({ success: false, message: "Failed to save draft" });
  }
};

export const submitInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      result,
      finalRating,
      finalNotes,
      rejectionReason,
      correctionReason,
    } = req.body;

    const { error, message, inspection } = await ensureOwnership(
      id,
      req.user.id,
    );
    if (error) return res.status(error).json({ success: false, message });

    if (!["VERIFIED", "REJECTED", "NEEDS_CORRECTION"].includes(result)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid final result" });
    }
    if (result === "REJECTED" && !rejectionReason) {
      return res
        .status(422)
        .json({ success: false, message: "Rejection reason is required" });
    }
    if (result === "NEEDS_CORRECTION" && !correctionReason) {
      return res
        .status(422)
        .json({ success: false, message: "Correction reason is required" });
    }
    if (finalRating !== undefined && (finalRating < 1 || finalRating > 5)) {
      return res
        .status(422)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const checklist = await prisma.inspectionChecklist.findUnique({
      where: { inspectionId: id },
    });
    const requiredFields = [
      "sellerVerified",
      "documentsVerified",
      "vehicleIdentityVerified",
      "exteriorVerified",
      "interiorVerified",
      "mechanicalVerified",
      "locationVerified",
      "photosCompleted",
    ];
    const incomplete = requiredFields.filter((f) => !checklist?.[f]);
    if (incomplete.length > 0) {
      const fieldLabels = {
        sellerVerified: "Seller Verification",
        documentsVerified: "Document Verification",
        vehicleIdentityVerified: "Vehicle Identity",
        exteriorVerified: "Exterior Inspection",
        interiorVerified: "Interior Inspection",
        mechanicalVerified: "Mechanical Inspection",
        locationVerified: "Location Verification",
        photosCompleted: "Photos & Evidence",
      };
      const incompleteLabels = incomplete.map((f) => fieldLabels[f] || f);
      return res.status(422).json({
        success: false,
        message: `Please complete all required sections before submitting. Missing: ${incompleteLabels.join(", ")}`,
        data: { incomplete: incompleteLabels },
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const insp = await tx.fieldInspection.update({
        where: { id },
        data: {
          status: "COMPLETED",
          result,
          finalRating: finalRating || null,
          finalNotes: finalNotes || null,
          rejectionReason: result === "REJECTED" ? rejectionReason : null,
          correctionReason:
            result === "NEEDS_CORRECTION" ? correctionReason : null,
          completedAt: new Date(),
        },
      });

      if (inspection.assignedById) {
        await tx.inspectionNotification.create({
          data: {
            userId: inspection.assignedById,
            inspectionId: id,
            title: "Inspection report submitted",
            message: `Inspector submitted the report for ${inspection.inspectionNo}. Result: ${result}.`,
          },
        });
        console.log(
          `📧 Admin Notification: "Inspection report submitted" - Report ${inspection.inspectionNo} with result: ${result}`,
        );
      }

      await tx.inspectionNotification.create({
        data: {
          userId: inspection.sellerId,
          inspectionId: id,
          title:
            result === "VERIFIED"
              ? "Your vehicle passed field verification"
              : result === "REJECTED"
                ? "Your vehicle inspection was rejected"
                : "Your vehicle needs correction",
          message:
            result === "VERIFIED"
              ? "Your vehicle inspection has been completed and verified."
              : result === "REJECTED"
                ? rejectionReason
                : correctionReason,
        },
      });
      console.log(
        `📧 Seller Notification: "${result === "VERIFIED" ? "Your vehicle passed field verification" : result === "REJECTED" ? "Your vehicle inspection was rejected" : "Your vehicle needs correction"}" - Message: ${result === "VERIFIED" ? "Completed and verified" : result === "REJECTED" ? rejectionReason : correctionReason}`,
      );
      console.log(`✅ Inspection ${id} submitted with result: ${result}`);

      return insp;
    });

    res.json({
      success: true,
      message: "Inspection submitted successfully",
      data: updated,
    });
  } catch (error) {
    console.error("submitInspection error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit inspection" });
  }
};

// ---- Notifications ----

export const getNotifications = async (req, res) => {
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
    console.error("getNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.inspectionNotification.findUnique({
      where: { id },
    });
    if (!notif || notif.userId !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    const updated = await prisma.inspectionNotification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({
      success: true,
      message: "Notification marked read",
      data: updated,
    });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.inspectionNotification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: "All notifications marked read" });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notifications" });
  }
};

export const getCalendarInspections = async (req, res) => {
  try {
    const inspectorId = req.user.id;
    const { month, year, status, priority } = req.query; // month: 1-12

    let where = { inspectorId };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      where.OR = [
        { scheduledDate: { gte: start, lte: end } },
        { deadline: { gte: start, lte: end } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const inspections = await prisma.fieldInspection.findMany({
      where,
      include: {
        vehicleListing: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            images: true,
          },
        },
        seller: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    res.json({
      success: true,
      message: "Calendar inspections fetched",
      data: inspections,
    });
  } catch (error) {
    console.error("getCalendarInspections error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load calendar" });
  }
};
