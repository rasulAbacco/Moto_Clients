import prisma from "../../prismaClient.js";

export const getPartnerReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const partnerId = req.user.id;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const where = {
      referrerPartnerId: partnerId,
      ...(search && {
        OR: [
          {
            referredUser: {
              email: { contains: search, mode: "insensitive" },
            },
          },
          {
            referredUser: {
              username: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }),
    };

    // 1️⃣ Fetch referrals + users
    const [referrals, total, stats] = await prisma.$transaction([
      prisma.referral.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          referredUser: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
              address: true,
              plan: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.referral.count({ where }),
      prisma.referral.groupBy({
        by: ["status"],
        where: { referrerPartnerId: partnerId },
        _count: true,
      }),
    ]);

    // 2️⃣ Collect emails
    const emails = referrals.map((r) => r.referredUser?.email).filter(Boolean);

    // 3️⃣ Fetch ONLY successful renewals (ACTIVE)
    const payments = await prisma.payment.findMany({
      where: {
        email: { in: emails },
        status: "ACTIVE",
      },
      orderBy: { paidAt: "desc" },
    });

    // 4️⃣ Group payments by email
    const paymentMap = {};
    for (const p of payments) {
      if (!paymentMap[p.email]) {
        paymentMap[p.email] = [];
      }
      paymentMap[p.email].push(p);
    }

    // 5️⃣ Summary formatting
    const summary = {
      totalReferrals: total,
      successfulReferrals:
        stats.find((s) => s.status === "REWARDED" || s.status === "PAID")
          ?._count || 0,
      pendingReferrals:
        stats.find((s) => s.status === "REGISTERED")?._count || 0,
    };

    // 6️⃣ Final formatting with dynamic commission calculation
    const formattedReferrals = referrals.map((r) => {
      const email = r.referredUser?.email;
      const userPayments = paymentMap[email] || [];

      // Latest payment for display
      const latestPayment = userPayments[0];

      // 🔥 Commission Calculation
      let calculatedCommission = 0;

      if (userPayments.length > 0) {
        const plan = latestPayment.plan;

        if (plan === "STANDARD") {
          calculatedCommission = userPayments.length * 100;
        }

        if (plan === "PREMIUM") {
          calculatedCommission = userPayments.length * 200;
        }
      }

      return {
        id: r.id,

        // 👤 User Info
        username: r.referredUser?.username,
        email,
        phone: r.referredUser?.phone,
        address: r.referredUser?.address,
        joinDate: r.referredUser?.createdAt,

        // 💳 Payment Info
        paymentStatus: latestPayment?.status || "NO_PAYMENT",
        paymentDate: latestPayment?.paidAt || null,
        expiryDate: latestPayment?.expiryDate || null,
        isTrial: latestPayment?.isTrial || false,
        trialEndDate: latestPayment?.trialEndDate || null,

        // 📦 Plan Info
        plan: latestPayment?.plan || r.referredUser?.plan,
        amount: latestPayment?.amount || 0,

        // 💰 Dynamically Calculated Commission
        commission: calculatedCommission,

        // 🔁 Referral Info
        referralStatus: r.status,
        convertedAt: r.convertedAt,
        referralCreatedAt: r.createdAt,
      };
    });

    res.json({
      summary,
      referrals: formattedReferrals,
      pagination: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Partner referrals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
