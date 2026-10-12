import prisma from "../../prismaClient.js";

export const getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", status, exportAll } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { referralCode: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    /* ======================================================
       1️⃣ Fetch Partners With Referrals
    ====================================================== */

    const [partners, total] = await prisma.$transaction([
      prisma.referralPartner.findMany({
        where,
        skip: exportAll ? undefined : skip,
        take: exportAll ? undefined : pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          referrals: {
            include: {
              referredUser: {
                select: { email: true },
              },
            },
          },
          payouts: {
            where: { status: "PENDING" },
            select: { amount: true },
          },
        },
      }),
      prisma.referralPartner.count({ where }),
    ]);

    /* ======================================================
       2️⃣ Collect All Referred Emails
    ====================================================== */

    const allEmails = [];

    partners.forEach((partner) => {
      partner.referrals.forEach((ref) => {
        if (ref.referredUser?.email) {
          allEmails.push(ref.referredUser.email);
        }
      });
    });

    /* ======================================================
       3️⃣ Fetch Active Payments
    ====================================================== */

    const payments = await prisma.payment.findMany({
      where: {
        email: { in: allEmails },
        status: "ACTIVE",
      },
      select: {
        email: true,
        plan: true,
      },
    });

    /* ======================================================
       4️⃣ Map Payments by Email
    ====================================================== */

    const paymentMap = {};
    for (const p of payments) {
      if (!paymentMap[p.email]) {
        paymentMap[p.email] = [];
      }
      paymentMap[p.email].push(p);
    }

    /* ======================================================
       5️⃣ Calculate Commission Per Partner
    ====================================================== */

    let globalEarnings = 0;
    let netReferrals = 0;

    const formatted = partners.map((partner) => {
      let totalEarnings = 0;

      netReferrals += partner.referrals.length;

      partner.referrals.forEach((ref) => {
        const email = ref.referredUser?.email;
        const userPayments = paymentMap[email] || [];

        userPayments.forEach((payment) => {
          let commission = 0;

          if (payment.plan === "STANDARD") commission = 100;
          if (payment.plan === "PREMIUM") commission = 200;

          totalEarnings += commission;
        });
      });

      globalEarnings += totalEarnings;

      return {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        upiId: partner.upiId,
        address: partner.address,
        referralCode: partner.referralCode,
        totalReferrals: partner.referrals.length,
        totalEarnings,
        pendingPayout: partner.payouts.reduce(
          (sum, pay) => sum + pay.amount,
          0,
        ),
        isActive: partner.isActive,
      };
    });

    /* ======================================================
       6️⃣ Pending Ledger (All Partners)
    ====================================================== */

    const pendingLedger = await prisma.referralPayout.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    /* ======================================================
       7️⃣ Response
    ====================================================== */

    res.json({
      data: formatted,
      metrics: {
        totalPartners: total,
        netReferrals,
        pendingLedger: pendingLedger._sum.amount || 0,
        totalEarnings: globalEarnings,
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
    console.error("Admin partner fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const togglePartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await prisma.referralPartner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const updated = await prisma.referralPartner.update({
      where: { id: partner.id },
      data: { isActive: !partner.isActive },
    });

    res.json({
      message: "Status updated",
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("Toggle partner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
