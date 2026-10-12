// server/src/controllers/partner/dashboard.controller.js
import prisma from "../../prismaClient.js";

export const getPartnerDashboard = async (req, res) => {
  try {
    const partnerId = req.user.id;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    /* ----------------------------------------------------
       1️⃣ Get referral statistics + activity
    ---------------------------------------------------- */
    const [
      totalReferrals,
      currentMonthReferrals,
      lastMonthReferrals,
      recentActivity,
      referralsForRevenue,
    ] = await prisma.$transaction([
      prisma.referral.count({
        where: { referrerPartnerId: partnerId },
      }),

      prisma.referral.count({
        where: {
          referrerPartnerId: partnerId,
          createdAt: { gte: startOfThisMonth },
        },
      }),

      prisma.referral.count({
        where: {
          referrerPartnerId: partnerId,
          createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        },
      }),

      prisma.referral.findMany({
        where: { referrerPartnerId: partnerId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          referredUser: {
            select: { companyName: true, email: true, plan: true },
          },
        },
      }),

      // Needed to calculate revenue
      prisma.referral.findMany({
        where: { referrerPartnerId: partnerId },
        include: {
          referredUser: {
            select: { email: true },
          },
        },
      }),
    ]);

    /* ----------------------------------------------------
       2️⃣ Calculate Revenue from ACTIVE Payments
    ---------------------------------------------------- */

    const emails = referralsForRevenue
      .map((r) => r.referredUser?.email)
      .filter(Boolean);

    const payments = await prisma.payment.findMany({
      where: {
        email: { in: emails },
        status: "ACTIVE",
      },
      orderBy: { paidAt: "desc" },
    });

    let totalRevenue = 0;

    for (const payment of payments) {
      if (payment.plan === "STANDARD") totalRevenue += 100;
      if (payment.plan === "PREMIUM") totalRevenue += 200;
    }

    /* ----------------------------------------------------
       3️⃣ Conversion Rate
    ---------------------------------------------------- */

    const totalPaid = await prisma.referral.count({
      where: {
        referrerPartnerId: partnerId,
        status: { in: ["PAID", "REWARDED"] },
      },
    });

    const conversionRate =
      totalReferrals > 0 ? ((totalPaid / totalReferrals) * 100).toFixed(1) : 0;

    /* ----------------------------------------------------
       4️⃣ Monthly Growth
    ---------------------------------------------------- */

    const growth =
      lastMonthReferrals === 0
        ? 100
        : (
            ((currentMonthReferrals - lastMonthReferrals) /
              lastMonthReferrals) *
            100
          ).toFixed(1);

    /* ----------------------------------------------------
       5️⃣ Response
    ---------------------------------------------------- */

    res.json({
      metrics: {
        totalRevenue,
        activeNetwork: totalReferrals,
        conversionRate: `${conversionRate}%`,
        monthlyGrowth: `${growth}%`,
      },
      activity: recentActivity.map((r) => ({
        id: r.id,
        entity: r.referredUser?.companyName || "New Garage",
        email: r.referredUser?.email,
        status: r.status,
        time: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Dashboard load error:", error);
    res.status(500).json({ message: "Analytics failed to load" });
  }
};
