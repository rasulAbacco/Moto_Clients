// services/support/userSupportSnapshotService.js

import prisma from "../../prismaClient.js";

export async function updateUserSupportSnapshot(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiry: true,
      allowedCrms: true,
    },
  });

  if (!user) throw new Error("User not found");

  /*
  |--------------------------------------------------------------------------
  | RUN ALL AGGREGATIONS IN PARALLEL (CRITICAL OPTIMIZATION)
  |--------------------------------------------------------------------------
  */

  const [
    carClients,
    carServices,
    carCompleted,
    carRevenue,

    bikeServices,
    bikeRevenue,

    washServices,
    washRevenue,

    totalPayments,
    failedPayments,
    lastPayment,

    totalInvoices,
    totalPaid,
    totalPending,
  ] = await Promise.all([
    // ---------------- CAR ----------------
    prisma.client.count({
      where: { userId },
    }),

    prisma.service.count({
      where: { client: { userId } },
    }),

    prisma.service.count({
      where: {
        client: { userId },
        status: "COMPLETED",
      },
    }),

    prisma.invoice.aggregate({
      where: {
        ownerUserId: userId,
        status: "Paid",
      },
      _sum: { grandTotal: true },
    }),

    // ---------------- BIKE ----------------
    prisma.bikeService.count({
      where: { ownerUserId: userId },
    }),

    prisma.bikeInvoice.aggregate({
      where: {
        ownerUserId: userId,
        status: "Paid",
      },
      _sum: { grandTotal: true },
    }),

    // ---------------- WASH ----------------
    prisma.washingService.count({
      where: {
        client: { userId },
      },
    }),

    prisma.washBilling.aggregate({
      where: {
        userId,
        status: "PENDING",
      },
      _sum: { grandTotal: true },
    }),

    // ---------------- PAYMENTS ----------------
    prisma.payment.count({
      where: { userId },
    }),

    prisma.payment.count({
      where: {
        userId,
        status: "FAILED",
      },
    }),

    prisma.payment.findFirst({
      where: {
        userId,
        status: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
    }),

    // ---------------- BILLING ----------------
    prisma.invoice.count({
      where: { ownerUserId: userId },
    }),

    prisma.invoice.aggregate({
      where: {
        ownerUserId: userId,
        status: "Paid",
      },
      _sum: { grandTotal: true },
    }),

    prisma.invoice.aggregate({
      where: {
        ownerUserId: userId,
        status: "Pending",
      },
      _sum: { grandTotal: true },
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | UPSERT SNAPSHOT
  |--------------------------------------------------------------------------
  */

  await prisma.userSupportSnapshot.upsert({
    where: { userId },
    update: {
      currentPlan: user.plan,
      planExpiry: user.planExpiry,
      isActive: user.planExpiry
        ? new Date(user.planExpiry) > new Date()
        : false,
      allowedCrms: user.allowedCrms,

      carTotalClients: carClients,
      carTotalServices: carServices,
      carCompletedServices: carCompleted,
      carTotalRevenue: carRevenue._sum.grandTotal || 0,

      bikeTotalServices: bikeServices,
      bikeTotalRevenue: bikeRevenue._sum.grandTotal || 0,

      washTotalServices: washServices,
      washTotalRevenue: washRevenue._sum.grandTotal || 0,

      totalInvoices,
      totalPaid: totalPaid._sum.grandTotal || 0,
      totalPending: totalPending._sum.grandTotal || 0,

      totalPayments,
      lastPaymentDate: lastPayment?.createdAt || null,
      failedPaymentsCount: failedPayments,
    },
    create: {
      userId,
      currentPlan: user.plan,
      planExpiry: user.planExpiry,
      isActive: user.planExpiry
        ? new Date(user.planExpiry) > new Date()
        : false,
      allowedCrms: user.allowedCrms,

      carTotalClients: carClients,
      carTotalServices: carServices,
      carCompletedServices: carCompleted,
      carTotalRevenue: carRevenue._sum.grandTotal || 0,

      bikeTotalServices: bikeServices,
      bikeTotalRevenue: bikeRevenue._sum.grandTotal || 0,

      washTotalServices: washServices,
      washTotalRevenue: washRevenue._sum.grandTotal || 0,

      totalInvoices,
      totalPaid: totalPaid._sum.grandTotal || 0,
      totalPending: totalPending._sum.grandTotal || 0,

      totalPayments,
      lastPaymentDate: lastPayment?.createdAt || null,
      failedPaymentsCount: failedPayments,
    },
  });

  return true;
}
