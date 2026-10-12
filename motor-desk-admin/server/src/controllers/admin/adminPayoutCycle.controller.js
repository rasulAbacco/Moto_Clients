// controllers/admin/adminPayoutCycle.controller.js

import prisma from "../../prismaClient.js";
import { Parser } from "json2csv";

/* ======================================================
   Utility: Validate & Normalize Cycle Range
====================================================== */
const buildCycleMeta = (cycleStartRaw, cycleEndRaw) => {
  if (!cycleStartRaw || !cycleEndRaw) {
    throw new Error("cycleStart and cycleEnd are required");
  }

  const cycleStart = new Date(cycleStartRaw);
  const cycleEnd = new Date(cycleEndRaw);

  if (isNaN(cycleStart) || isNaN(cycleEnd)) {
    throw new Error("Invalid cycle date format");
  }

  const cycleLabel = `${cycleStart.toISOString().split("T")[0]}_to_${
    cycleEnd.toISOString().split("T")[0]
  }`;

  return { cycleStart, cycleEnd, cycleLabel };
};

/* ======================================================
   Internal Logic: Generate Payout Rows
====================================================== */
const generateCyclePayoutData = async (cycleStart, cycleEnd, cycleLabel) => {
  const payoutRows = [];

  /* ===============================
     PARTNERS
  =============================== */
  const partners = await prisma.referralPartner.findMany({
    include: {
      referrals: {
        include: { referredUser: true },
      },
    },
  });

  for (const partner of partners) {
    let cycleEarnings = 0;

    const emails = partner.referrals
      .map((r) => r.referredUser?.email)
      .filter(Boolean);

    if (emails.length) {
      const payments = await prisma.payment.findMany({
        where: {
          email: { in: emails },
          status: "ACTIVE",
          paidAt: { gte: cycleStart, lte: cycleEnd },
        },
      });

      payments.forEach((payment) => {
        if (payment.plan === "STANDARD") cycleEarnings += 100;
        if (payment.plan === "PREMIUM") cycleEarnings += 200;
      });
    }

    if (cycleEarnings > 0) {
      payoutRows.push({
        type: "PARTNER",
        id: partner.id,
        name: partner.name,
        email: partner.email,
        accountName: partner.accountName,
        accountNumber: partner.bankAccount,
        ifscCode: partner.ifscCode,
        upiId: partner.upiId,
        amount: cycleEarnings,
        cycle: cycleLabel,
      });
    }
  }

  /* ===============================
     USERS
  =============================== */
  const users = await prisma.user.findMany({
    where: { referralsMade: { some: {} } },
    include: {
      referralsMade: {
        include: { referredUser: true },
      },
    },
  });

  for (const user of users) {
    let cycleEarnings = 0;

    const emails = user.referralsMade
      .map((r) => r.referredUser?.email)
      .filter(Boolean);

    if (emails.length) {
      const payments = await prisma.payment.findMany({
        where: {
          email: { in: emails },
          status: "ACTIVE",
          paidAt: { gte: cycleStart, lte: cycleEnd },
        },
      });

      payments.forEach((payment) => {
        if (payment.plan === "STANDARD") cycleEarnings += 100;
        if (payment.plan === "PREMIUM") cycleEarnings += 200;
      });
    }

    if (cycleEarnings > 0) {
      payoutRows.push({
        type: "USER",
        id: user.id,
        name: user.username,
        email: user.email,
        accountName: user.accountName,
        accountNumber: user.bankAccount,
        ifscCode: user.ifscCode,
        upiId: user.upiId,
        amount: cycleEarnings,
        cycle: cycleLabel,
      });
    }
  }

  return payoutRows;
};

/* ======================================================
   1️⃣ EXPORT PAYOUTS FOR SELECTED CYCLE
   GET /export-cycle?cycleStart=YYYY-MM-DD&cycleEnd=YYYY-MM-DD
====================================================== */
export const exportCurrentCyclePayouts = async (req, res) => {
  try {
    const { cycleStart, cycleEnd } = req.query;

    const {
      cycleStart: start,
      cycleEnd: end,
      cycleLabel,
    } = buildCycleMeta(cycleStart, cycleEnd);

    const payoutRows = await generateCyclePayoutData(start, end, cycleLabel);

    const parser = new Parser();
    const csv = parser.parse(payoutRows);

    res.header("Content-Type", "text/csv");
    res.attachment(`payout_${cycleLabel}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export cycle error:", error);
    res.status(400).json({ message: error.message });
  }
};

/* ======================================================
   2️⃣ CONFIRM PAYOUT FOR SELECTED CYCLE
   POST /confirm-cycle
   Body:
   {
     cycleStart,
     cycleEnd,
     transactionReference
   }
====================================================== */
export const confirmCurrentCyclePayout = async (req, res) => {
  try {
    const { cycleStart, cycleEnd, transactionReference } = req.body;

    if (!transactionReference) {
      return res
        .status(400)
        .json({ message: "Transaction reference required" });
    }

    const {
      cycleStart: start,
      cycleEnd: end,
      cycleLabel,
    } = buildCycleMeta(cycleStart, cycleEnd);

    /* ===============================
       Duplicate Protection
    =============================== */
    const existing = await prisma.referralPayout.findFirst({
      where: { cycleLabel },
    });

    if (existing) {
      return res.status(400).json({
        message: "This cycle is already confirmed",
      });
    }

    const payoutRows = await generateCyclePayoutData(start, end, cycleLabel);

    for (const row of payoutRows) {
      await prisma.referralPayout.create({
        data: {
          amount: row.amount,
          status: "PAID",
          transactionReference,
          paidAt: new Date(),
          cycleStart: start,
          cycleEnd: end,
          cycleLabel,
          ...(row.type === "PARTNER"
            ? { partnerId: row.id }
            : { userId: row.id }),
        },
      });
    }

    res.json({
      message: "Cycle payout confirmed successfully",
      totalRecords: payoutRows.length,
    });
  } catch (error) {
    console.error("Confirm cycle error:", error);
    res.status(400).json({ message: error.message });
  }
};
