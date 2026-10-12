// server/src/controllers/admin/dashboard.controller.js
import prisma from "../../prismaClient.js";

export const getAdminDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    // 1️⃣ Parallel Aggregation for Performance
    const [softwareStats, partnerStats, financialStats, recentActivity] =
      await prisma.$transaction([
        // User/Software Health
        prisma.user.findMany({
          where: { role: "user" },
          select: { planExpiry: true, role: true },
        }),
        // Partner Metrics
        prisma.referralPartner.aggregate({
          _count: { id: true },
          _sum: { totalEarnings: true },
        }),
        // Financial Disbursement (Paid Out)
        prisma.referralPayout.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        }),
        // Global Referral Activity
        prisma.referral.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            referredUser: {
              select: { username: true, email: true, plan: true },
            },
            referrerPartner: { select: { name: true } },
          },
        }),
      ]);

    // 2️⃣ Calculate User Segments (Logic)
    const stats = {
      totalUsers: softwareStats.length,
      activeUsers: 0,
      expiredUsers: 0,
      trialUsers: 0,
    };

    softwareStats.forEach((u) => {
      if (!u.planExpiry) {
        stats.trialUsers++;
      } else if (new Date(u.planExpiry) > now) {
        stats.activeUsers++;
      } else {
        stats.expiredUsers++;
      }
    });

    res.json({
      software: stats,
      partners: {
        total: partnerStats._count.id,
        accruedCommissions: partnerStats._sum.totalEarnings || 0,
        actuallyPaid: financialStats._sum.amount || 0,
      },
      recentActivity: recentActivity.map((r) => ({
        id: r.id,
        user: r.referredUser?.username || r.referredUser?.email,
        plan: r.referredUser?.plan,
        partner: r.referrerPartner?.name || "Direct/User",
        status: r.status,
        date: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard failed to sync" });
  }
};
