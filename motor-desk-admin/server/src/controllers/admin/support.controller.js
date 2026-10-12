import prisma from "../../prismaClient.js";
import { updateUserSupportSnapshot } from "../../services/support/userSupportSnapshotService.js";

/* ============================================================
   SNAPSHOT
============================================================ */

export const getSupportCustomer = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId || isNaN(userId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let snapshot = await prisma.userSupportSnapshot.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            companyName: true,
            createdAt: true,
            plan: true,
            planExpiry: true,
            allowedCrms: true,
            isSuspended: true,
          },
        },
      },
    });

    if (!snapshot) {
      await updateUserSupportSnapshot(userId);

      snapshot = await prisma.userSupportSnapshot.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              companyName: true,
              createdAt: true,
              plan: true,
              planExpiry: true,
              allowedCrms: true,
              isSuspended: true,
            },
          },
        },
      });
    }

    return res.json({ success: true, data: snapshot });
  } catch (err) {
    console.error("getSupportCustomer error:", err);
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   SEARCH
============================================================ */

export const searchSupportUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { companyName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        companyName: true,
        plan: true,
        planExpiry: true,
        isSuspended: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   PAYMENTS (EMAIL LINKED)
============================================================ */

export const getCustomerPayments = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const payments = await prisma.payment.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   SERVICES
============================================================ */

export const getCustomerServices = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const [carServices, bikeServices, washServices] = await Promise.all([
      prisma.service.findMany({
        where: { client: { userId } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.bikeService.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.washingService.findMany({
        where: { client: { userId } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: { carServices, bikeServices, washServices },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   REFRESH SNAPSHOT
============================================================ */

export const refreshCustomerSnapshot = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    await updateUserSupportSnapshot(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   EXTEND PLAN
============================================================ */

export const extendUserPlan = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { days } = req.body;

    if (!days || isNaN(days))
      return res.status(400).json({ success: false, message: "Invalid days" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const baseDate =
      user.planExpiry && new Date(user.planExpiry) > new Date()
        ? new Date(user.planExpiry)
        : new Date();

    baseDate.setDate(baseDate.getDate() + Number(days));

    await prisma.user.update({
      where: { id: userId },
      data: { planExpiry: baseDate },
    });

    await prisma.supportActionLog.create({
      data: {
        adminId: req.admin.id,
        userId,
        action: "PLAN_EXTENDED",
        meta: { daysExtended: days, newExpiry: baseDate },
      },
    });

    await updateUserSupportSnapshot(userId);

    res.json({ success: true });
  } catch (err) {
    console.error("extendUserPlan error:", err);
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   TOGGLE CRM
============================================================ */

export const toggleUserCrmAccess = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { crmType } = req.body;

    if (!crmType)
      return res
        .status(400)
        .json({ success: false, message: "Missing crmType" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ success: false });

    const updatedCrms = user.allowedCrms.includes(crmType)
      ? user.allowedCrms.filter((c) => c !== crmType)
      : [...user.allowedCrms, crmType];

    await prisma.user.update({
      where: { id: userId },
      data: { allowedCrms: updatedCrms },
    });

    await prisma.supportActionLog.create({
      data: {
        adminId: req.admin.id,
        userId,
        action: "CRM_ACCESS_TOGGLED",
        meta: { crmType },
      },
    });

    await updateUserSupportSnapshot(userId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   TOGGLE STATUS
============================================================ */

export const toggleUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ success: false });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !user.isSuspended },
    });

    await prisma.supportActionLog.create({
      data: {
        adminId: req.admin.id,
        userId,
        action: "ACCOUNT_STATUS_TOGGLED",
        meta: { newStatus: updated.isSuspended },
      },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   LOGS
============================================================ */

export const getSupportLogs = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const logs = await prisma.supportActionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   INVOICES
============================================================ */

export const getCustomerInvoices = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { ownerUserId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({
        where: { ownerUserId: userId },
      }),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getCustomerInvoices error:", err);
    res.status(500).json({ success: false });
  }
};

/* ============================================================
   CLIENTS
============================================================ */

export const getCustomerClients = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    if (!userId || isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({
        where: { userId },
      }),
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getCustomerClients error:", err);
    res.status(500).json({ success: false });
  }
};
