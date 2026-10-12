// controllers/admin/adminPayout.controller.js

import prisma from "../../prismaClient.js";

/* ======================================================
   1️⃣ GET ALL PAYOUT PREVIEW (ADMIN)
   Optimized (No N+1)
====================================================== */
export const getAllPayouts = async (req, res) => {
  try {
    const result = [];

    /* ===============================
       FETCH ALL PAYMENTS ONCE
    =============================== */
    const allActivePayments = await prisma.payment.findMany({
      where: { status: "ACTIVE" },
      select: { email: true, plan: true },
    });

    const commissionMap = {};

    for (const payment of allActivePayments) {
      const commission =
        payment.plan === "STANDARD"
          ? 100
          : payment.plan === "PREMIUM"
            ? 200
            : 0;

      commissionMap[payment.email] =
        (commissionMap[payment.email] || 0) + commission;
    }

    /* ===============================
       PARTNERS
    =============================== */
    const partners = await prisma.referralPartner.findMany({
      include: {
        referrals: {
          include: {
            referredUser: { select: { email: true } },
          },
        },
        payouts: true,
      },
    });

    for (const partner of partners) {
      let totalEarnings = 0;

      for (const ref of partner.referrals) {
        const email = ref.referredUser?.email;
        if (email && commissionMap[email]) {
          totalEarnings += commissionMap[email];
        }
      }

      const paidAmount = partner.payouts
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + p.amount, 0);

      const availableBalance = totalEarnings - paidAmount;

      const latestPaid = partner.payouts
        .filter((p) => p.status === "PAID")
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0];

      result.push({
        id: partner.id,
        type: "PARTNER",
        name: partner.name,
        email: partner.email,
        payoutEndpoint: partner.upiId,
        totalEarnings,
        paidAmount,
        availableBalance,
        lastPaidAt: latestPaid?.paidAt || null,
        lastTransactionReference: latestPaid?.transactionReference || null,
      });
    }

    /* ===============================
       USERS
    =============================== */
    const users = await prisma.user.findMany({
      where: { referralsMade: { some: {} } },
      include: {
        referralsMade: {
          include: {
            referredUser: { select: { email: true } },
          },
        },
        payouts: true,
      },
    });

    for (const user of users) {
      let totalEarnings = 0;

      for (const ref of user.referralsMade) {
        const email = ref.referredUser?.email;
        if (email && commissionMap[email]) {
          totalEarnings += commissionMap[email];
        }
      }

      const paidAmount = user.payouts
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + p.amount, 0);

      const availableBalance = totalEarnings - paidAmount;

      const latestPaid = user.payouts
        .filter((p) => p.status === "PAID")
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0];

      result.push({
        id: user.id,
        type: "USER",
        name: user.username,
        email: user.email,
        payoutEndpoint: user.upiId || "INTERNAL",
        totalEarnings,
        paidAmount,
        availableBalance,
        lastPaidAt: latestPaid?.paidAt || null,
        lastTransactionReference: latestPaid?.transactionReference || null,
      });
    }

    return res.json({ data: result });
  } catch (error) {
    console.error("Get payout preview error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   2️⃣ MARK AS PAID (MANUAL SINGLE PAYMENT)
====================================================== */
export const markPartnerPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, transactionReference } = req.body;

    if (!id || !type || !amount || !transactionReference) {
      return res.status(400).json({
        message: "Type, amount and transaction reference required",
      });
    }

    const parsedId = parseInt(id);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedId) || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!["PARTNER", "USER"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type. Must be USER or PARTNER",
      });
    }

    /* ===============================
       Calculate Available Balance Again (Security)
    =============================== */

    const entity =
      type === "PARTNER"
        ? await prisma.referralPartner.findUnique({
            where: { id: parsedId },
            include: {
              referrals: {
                include: { referredUser: { select: { email: true } } },
              },
              payouts: true,
            },
          })
        : await prisma.user.findUnique({
            where: { id: parsedId },
            include: {
              referralsMade: {
                include: { referredUser: { select: { email: true } } },
              },
              payouts: true,
            },
          });

    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const allActivePayments = await prisma.payment.findMany({
      where: { status: "ACTIVE" },
      select: { email: true, plan: true },
    });

    const commissionMap = {};
    for (const payment of allActivePayments) {
      const commission =
        payment.plan === "STANDARD"
          ? 100
          : payment.plan === "PREMIUM"
            ? 200
            : 0;

      commissionMap[payment.email] =
        (commissionMap[payment.email] || 0) + commission;
    }

    const referrals =
      type === "PARTNER" ? entity.referrals : entity.referralsMade;

    let totalEarnings = 0;

    for (const ref of referrals) {
      const email = ref.referredUser?.email;
      if (email && commissionMap[email]) {
        totalEarnings += commissionMap[email];
      }
    }

    const paidAmount = entity.payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = totalEarnings - paidAmount;

    if (parsedAmount > availableBalance) {
      return res.status(400).json({
        message: "Amount exceeds available balance",
      });
    }

    /* ===============================
       Create Payout Record
    =============================== */

    const payout = await prisma.referralPayout.create({
      data: {
        amount: parsedAmount,
        status: "PAID",
        transactionReference,
        paidAt: new Date(),
        ...(type === "PARTNER"
          ? { partnerId: parsedId }
          : { userId: parsedId }),
      },
    });

    return res.json({
      message: "Payout recorded successfully",
      data: payout,
    });
  } catch (error) {
    console.error("Mark paid error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
