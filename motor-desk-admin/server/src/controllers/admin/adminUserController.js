import prisma from "../../prismaClient.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", status, exportAll } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const now = new Date();

    let where = {};

    // 🔎 Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // 📌 Status filter
    if (status === "active") {
      where.OR = [{ planExpiry: null }, { planExpiry: { gt: now } }];
    }

    if (status === "expired") {
      where.planExpiry = { lt: now };
    }

    const users = await prisma.user.findMany({
      where,
      skip: exportAll ? undefined : skip,
      take: exportAll ? undefined : pageSize,
      orderBy: [
        { planExpiry: "desc" }, // future dates first
        { createdAt: "desc" },
      ],
      include: {
        referredByUser: {
          select: { email: true },
        },
        _count: {
          select: {
            staffMembers: true, // total staff
            carStaffLogins: {
              where: { isActive: true }, // active staff
            },
          },
        },
      },
    });

    const total = await prisma.user.count({ where });

    // 🔥 Format + Ensure Active Users First
    const formatted = users
      .map((u) => {
        const isActive = !u.planExpiry || new Date(u.planExpiry) > now;

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          phone: u.phone,
          companyName: u.companyName,
          address: u.address,
          gstNumber: u.gstNumber,
          allowedCrms: u.allowedCrms,
          plan: u.plan,
          planExpiry: u.planExpiry,
          myReferralCode: u.myReferralCode,
          referredBy: u.referredByUser?.email || null,
          totalStaff: u._count.staffMembers,
          activeStaff: u._count.carStaffLogins,
          isActive,
        };
      })
      .sort((a, b) => Number(b.isActive) - Number(a.isActive));

    res.json({
      data: formatted,
      pagination: exportAll
        ? null
        : {
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
          },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
