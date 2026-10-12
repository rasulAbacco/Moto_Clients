// server/src/controllers/partner/earning.controller.js
import prisma from "../../prismaClient.js";

export const getPartnerEarnings = async (req, res) => {
  try {
    const partnerId = req.user.id;

    /* ======================================================
       1️⃣ FETCH PAYOUT HISTORY
    ====================================================== */
    const payouts = await prisma.referralPayout.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
    });

    /* ======================================================
       2️⃣ FETCH ALL REFERRALS
    ====================================================== */
    const referrals = await prisma.referral.findMany({
      where: { referrerPartnerId: partnerId },
      include: {
        referredUser: {
          select: {
            email: true,
            companyName: true,
            username: true,
          },
        },
      },
    });

    const emails = referrals.map((r) => r.referredUser?.email).filter(Boolean);

    /* ======================================================
       3️⃣ FETCH ACTIVE PAYMENTS (ONLY SUCCESSFUL RENEWALS)
    ====================================================== */
    const payments = await prisma.payment.findMany({
      where: {
        email: { in: emails },
        status: "ACTIVE",
      },
      orderBy: { paidAt: "desc" },
    });

    /* ======================================================
       4️⃣ GROUP PAYMENTS BY EMAIL
    ====================================================== */
    const paymentMap = {};
    for (const p of payments) {
      if (!paymentMap[p.email]) {
        paymentMap[p.email] = [];
      }
      paymentMap[p.email].push(p);
    }

    /* ======================================================
       5️⃣ CALCULATE COMMISSION DYNAMICALLY
    ====================================================== */
    let totalEarnings = 0;
    const monthlyData = {};

    for (const referral of referrals) {
      const email = referral.referredUser?.email;
      const userPayments = paymentMap[email] || [];

      if (!userPayments.length) continue;

      for (const payment of userPayments) {
        let commission = 0;

        if (payment.plan === "STANDARD") commission = 100;
        if (payment.plan === "PREMIUM") commission = 200;

        totalEarnings += commission;

        const date = new Date(payment.paidAt);
        const monthYear = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
            totalAmount: 0,
            referrals: [],
          };
        }

        monthlyData[monthYear].totalAmount += commission;

        monthlyData[monthYear].referrals.push({
          garageName:
            referral.referredUser?.companyName ||
            referral.referredUser?.username,
          plan: payment.plan,
          amount: commission,
          date: date.toLocaleDateString(),
        });
      }
    }

    /* ======================================================
       6️⃣ PAYOUT CALCULATIONS
    ====================================================== */

    const paidAmount = payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayout = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = totalEarnings - paidAmount - pendingPayout;

    /* ======================================================
       7️⃣ RESPONSE
    ====================================================== */

    res.json({
      summary: {
        totalEarnings,
        paidAmount,
        pendingPayout,
        availableBalance,
      },
      payoutHistory: payouts,
      monthlyBreakdown: Object.values(monthlyData).sort((a, b) => {
        return new Date(b.month) - new Date(a.month);
      }),
    });
  } catch (error) {
    console.error("Earnings fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
