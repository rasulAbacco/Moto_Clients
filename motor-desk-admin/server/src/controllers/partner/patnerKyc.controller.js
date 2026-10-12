// src/controllers/partner/kycController.js

import prisma from "../../prismaClient.js";

/**
 * Update Partner KYC + Store Documents as Binary (Bytes)
 */
export const updatePartnerKyc = async (req, res) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      return res.status(401).json({
        message: "Partner session not identified",
      });
    }

    const {
      bankAccount,
      accountName,
      bankName,
      branch,
      ifscCode,
      upiId,
      panNumber,
    } = req.body;

    // 1️⃣ Fetch Partner Earnings for Compliance Check
    const partner = await prisma.referralPartner.findUnique({
      where: { id: partnerId },
      select: { totalEarnings: true },
    });

    if (!partner) {
      return res.status(404).json({
        message: "Partner record not found",
      });
    }

    // 2️⃣ PAN Mandatory if Earnings > 30,000
    if (
      partner.totalEarnings > 30000 &&
      (!panNumber || panNumber.trim() === "")
    ) {
      return res.status(400).json({
        message:
          "PAN Number is mandatory for accounts exceeding ₹30,000 in earnings.",
      });
    }

    // 3️⃣ Extract Uploaded Files (Multer memoryStorage)
    const panFile = req.files?.panDocument?.[0];
    const bankFile = req.files?.bankProofDocument?.[0];

    // 4️⃣ Optional Additional File Validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (panFile && !allowedTypes.includes(panFile.mimetype)) {
      return res.status(400).json({
        message: "Invalid PAN document type. Only JPG, PNG, PDF allowed.",
      });
    }

    if (bankFile && !allowedTypes.includes(bankFile.mimetype)) {
      return res.status(400).json({
        message:
          "Invalid Bank Proof document type. Only JPG, PNG, PDF allowed.",
      });
    }

    // 5️⃣ Build Update Object
    const updateData = {
      bankAccount,
      accountName,
      bankName,
      branch,
      ifscCode,
      upiId,
      panNumber,
      kycStatus: "PENDING", // Reset for re-verification whenever KYC details change
    };

    if (panFile) {
      updateData.panDocument = panFile.buffer;
      updateData.panDocumentType = panFile.mimetype;
    }

    if (bankFile) {
      updateData.bankProofDocument = bankFile.buffer;
      updateData.bankProofType = bankFile.mimetype;
    }

    // 6️⃣ Update Database
    const updatedPartner = await prisma.referralPartner.update({
      where: { id: partnerId },
      data: updateData,
    });

    // ✅ FIX: Return the ACTUAL status from the database, not just the request files.
    // The frontend needs to know if the documents exist in the DB (hasPanDocument),
    // not just if they were uploaded 2 seconds ago.

    return res.json({
      message: "Financial registry updated successfully",

      // The fields required by your Frontend UI
      kycStatus: updatedPartner.kycStatus,
      hasPanDocument: !!updatedPartner.panDocument, // Checks if DB field is not null
      hasBankProofDocument: !!updatedPartner.bankProofDocument, // Checks if DB field is not null

      // Return updated banking details so UI syncs immediately
      bankAccount: updatedPartner.bankAccount,
      accountName: updatedPartner.accountName,
      bankName: updatedPartner.bankName,
      branch: updatedPartner.branch,
      ifscCode: updatedPartner.ifscCode,
      upiId: updatedPartner.upiId,
      panNumber: updatedPartner.panNumber,
    });
  } catch (error) {
    console.error("KYC Update Error:", error);

    return res.status(500).json({
      message: "Internal server error during registry update",
      error: error.message,
    });
  }
};
