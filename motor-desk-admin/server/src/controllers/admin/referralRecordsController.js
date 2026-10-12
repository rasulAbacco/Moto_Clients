import prisma from "../../prismaClient.js";

export const getReferralRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      type,
      status,
      exportAll,
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let where = {};

    /* ======================================================
       1️⃣ FILTERS
    ====================================================== */

    if (type === "USER") {
      where.referrerUserId = { not: null };
    }

    if (type === "PARTNER") {
      where.referrerPartnerId = { not: null };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { referralCode: { contains: search, mode: "insensitive" } },
        {
          referredUser: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        {
          referrerUser: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        {
          referrerPartner: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    /* ======================================================
       2️⃣ FETCH REFERRALS
    ====================================================== */

    const referrals = await prisma.referral.findMany({
      where,
      skip: exportAll ? undefined : skip,
      take: exportAll ? undefined : pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        referrerUser: {
          select: { id: true, username: true, email: true },
        },
        referrerPartner: {
          select: { id: true, name: true, email: true },
        },
        referredUser: {
          select: {
            id: true,
            username: true,
            email: true,
            plan: true,
            createdAt: true,
          },
        },
      },
    });

    const total = await prisma.referral.count({ where });

    /* ======================================================
       3️⃣ FETCH ACTIVE PAYMENTS
    ====================================================== */

    const referredEmails = referrals
      .map((r) => r.referredUser?.email)
      .filter(Boolean);

    const activePayments = await prisma.payment.findMany({
      where: {
        email: { in: referredEmails },
        status: "ACTIVE",
      },
      orderBy: { paidAt: "desc" },
    });

    // Map latest ACTIVE payment per email
    const paymentMap = {};
    for (const payment of activePayments) {
      if (!paymentMap[payment.email]) {
        paymentMap[payment.email] = payment;
      }
    }

    /* ======================================================
       4️⃣ FIXED COMMISSION CALCULATION
    ====================================================== */

    let totalCommission = 0;

    const formatted = referrals.map((r) => {
      const email = r.referredUser?.email;
      const activePayment = paymentMap[email];

      let commission = 0;

      if (activePayment) {
        if (activePayment.plan === "STANDARD") {
          commission = 100;
        } else if (activePayment.plan === "PREMIUM") {
          commission = 200;
        }

        totalCommission += commission;
      }

      return {
        id: r.id,
        referralCode: r.referralCode,
        type: r.referrerUserId ? "USER" : "PARTNER",

        referrerName:
          r.referrerUser?.username || r.referrerPartner?.name || "-",
        referrerEmail: r.referrerUser?.email || r.referrerPartner?.email || "-",

        referredUserName: r.referredUser?.username,
        referredUserEmail: email,
        joiningDate: r.referredUser?.createdAt,

        plan: activePayment?.plan || r.referredUser?.plan,
        billing: activePayment?.billingPeriod || "N/A",
        amount: activePayment?.amount || 0,
        paidAt: activePayment?.paidAt || null,

        commissionAmount: commission,
        paymentStatus: activePayment ? "ACTIVE" : "NO_ACTIVE_PAYMENT",

        status: r.status,
        rewardGiven: r.rewardGiven,
        createdAt: r.createdAt,
        convertedAt: r.convertedAt,
      };
    });

    /* ======================================================
       5️⃣ RESPONSE
    ====================================================== */

    res.json({
      data: formatted,
      summary: {
        totalRecords: total,
        totalCommission,
      },
      pagination: exportAll
        ? null
        : {
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
          },
    });
  } catch (error) {
    console.error("Admin referral records error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
