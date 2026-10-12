// server/src/controllers/admin/adminKyc.controller.js

import prisma from "../../prismaClient.js";

/**
 * =====================================================
 * 1️⃣ GET ALL KYC RECORDS (Partners + Users)
 * Supports optional ?status=PENDING
 * =====================================================
 */
export const getAllPartnerKYC = async (req, res) => {
  try {
    const { status } = req.query;

    const whereCondition = status ? { kycStatus: status } : {};

    /* ===============================
       Fetch Partners
    =============================== */
    const partners = await prisma.referralPartner.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        totalEarnings: true,
        kycStatus: true,
        isActive: true,

        upiId: true,
        bankAccount: true,
        accountName: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,

        panDocument: true,
        bankProofDocument: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    /* ===============================
       Fetch Users (Only those who referred someone)
    =============================== */
    const users = await prisma.user.findMany({
      where: {
        ...whereCondition,
        referralsMade: { some: {} },
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        companyName: true,

        kycStatus: true,

        upiId: true,
        bankAccount: true,
        accountName: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,

        panDocument: true,
        bankProofDocument: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    /* ===============================
       Normalize Response
    =============================== */

    const formattedPartners = partners.map((p) => ({
      id: p.id,
      type: "PARTNER",

      name: p.name,
      email: p.email,
      phone: p.phone,
      address: p.address,
      totalEarnings: p.totalEarnings,
      kycStatus: p.kycStatus,
      isActive: p.isActive,

      bankAccount: p.bankAccount,
      accountName: p.accountName,
      bankName: p.bankName,
      branch: p.branch,
      ifscCode: p.ifscCode,
      upiId: p.upiId,
      panNumber: p.panNumber,

      hasPanDocument: !!p.panDocument,
      hasBankProofDocument: !!p.bankProofDocument,

      createdAt: p.createdAt,
    }));

    const formattedUsers = users.map((u) => ({
      id: u.id,
      type: "USER",

      name: u.username,
      email: u.email,
      phone: u.phone,
      address: u.companyName,
      totalEarnings: null, // You can calculate dynamically if needed
      kycStatus: u.kycStatus,
      isActive: true,

      bankAccount: u.bankAccount,
      accountName: u.accountName,
      bankName: u.bankName,
      branch: u.branch,
      ifscCode: u.ifscCode,
      upiId: u.upiId,
      panNumber: u.panNumber,

      hasPanDocument: !!u.panDocument,
      hasBankProofDocument: !!u.bankProofDocument,

      createdAt: u.createdAt,
    }));

    const combined = [...formattedPartners, ...formattedUsers].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(combined);
  } catch (error) {
    console.error("Admin KYC Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch KYC records" });
  }
};

/**
 * =====================================================
 * 2️⃣ STREAM PAN DOCUMENT (User or Partner)
 * =====================================================
 */
export const getPartnerPanDocument = async (req, res) => {
  try {
    const { id, type } = req.params;

    let record;

    if (type === "PARTNER") {
      record = await prisma.referralPartner.findUnique({
        where: { id: parseInt(id) },
        select: { panDocument: true, panDocumentType: true },
      });
    } else {
      record = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { panDocument: true, panDocumentType: true },
      });
    }

    if (!record?.panDocument) {
      return res.status(404).json({ message: "PAN document not found" });
    }

    res.set("Content-Type", record.panDocumentType);
    res.send(record.panDocument);
  } catch (error) {
    res.status(500).json({ message: "Failed to load PAN document" });
  }
};

/**
 * =====================================================
 * 3️⃣ STREAM BANK PROOF (User or Partner)
 * =====================================================
 */
export const getPartnerBankProofDocument = async (req, res) => {
  try {
    const { id, type } = req.params;

    let record;

    if (type === "PARTNER") {
      record = await prisma.referralPartner.findUnique({
        where: { id: parseInt(id) },
        select: { bankProofDocument: true, bankProofType: true },
      });
    } else {
      record = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { bankProofDocument: true, bankProofType: true },
      });
    }

    if (!record?.bankProofDocument) {
      return res.status(404).json({ message: "Bank proof not found" });
    }

    res.set("Content-Type", record.bankProofType);
    res.send(record.bankProofDocument);
  } catch (error) {
    res.status(500).json({ message: "Failed to load bank proof" });
  }
};

/**
 * =====================================================
 * 4️⃣ UPDATE KYC STATUS (Single or Bulk)
 * =====================================================
 */
export const updateKycStatus = async (req, res) => {
  try {
    const { id, type } = req.params;
    const { status } = req.body;

    if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Bulk verify
    if (id === "all") {
      await prisma.referralPartner.updateMany({
        where: { kycStatus: "PENDING" },
        data: { kycStatus: "VERIFIED" },
      });

      await prisma.user.updateMany({
        where: { kycStatus: "PENDING" },
        data: { kycStatus: "VERIFIED" },
      });

      return res.json({
        message: "All pending KYC records verified successfully",
      });
    }

    if (type === "PARTNER") {
      await prisma.referralPartner.update({
        where: { id: parseInt(id) },
        data: { kycStatus: status },
      });
    } else {
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { kycStatus: status },
      });
    }

    res.json({ message: `KYC status updated to ${status}` });
  } catch (error) {
    console.error("Admin KYC Update Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
