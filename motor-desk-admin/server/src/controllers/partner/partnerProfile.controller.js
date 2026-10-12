import prisma from "../../prismaClient.js";
import { hashPassword } from "../../utils/hash.js";

/**
 * |--------------------------------------------------------------------------
 * | GET PARTNER PROFILE
 * |--------------------------------------------------------------------------
 */
export const getPartnerProfile = async (req, res) => {
  try {
    // Safety check to prevent "Cannot read properties of undefined"
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Authentication context missing" });
    }

    const partnerId = req.user.id;

    const partner = await prisma.referralPartner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        upiId: true,
        address: true,
        referralCode: true,
        isActive: true,
        createdAt: true,
        totalEarnings: true,
        totalReferrals: true,
        accountName: true,
        bankAccount: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,

        // ✅ ADD THESE FIELDS
        kycStatus: true,
        panDocument: true, // We need this to check if it exists
        bankProofDocument: true, // We need this to check if it exists
      },
    });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // ✅ OPTIMIZATION:
    // Do not send the actual Binary/Blob data in the JSON response (it's too heavy).
    // Instead, convert them to boolean flags for the frontend.
    const { panDocument, bankProofDocument, ...profileData } = partner;

    res.json({
      ...profileData,
      hasPanDocument: !!panDocument, // Returns true if file exists, else false
      hasBankProofDocument: !!bankProofDocument, // Returns true if file exists, else false
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * |--------------------------------------------------------------------------
 * | UPDATE PARTNER PROFILE
 * |--------------------------------------------------------------------------
 */
export const updatePartnerProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Authentication context missing" });
    }

    const partnerId = req.user.id;
    const { name, phone, upiId, address, password } = req.body;

    // Prepare basic update data
    const updateData = {
      name,
      phone,
      upiId,
      address,
    };

    // If password is provided and not just empty spaces, hash it
    if (password && password.trim() !== "") {
      updateData.password = await hashPassword(password);
    }

    const updatedPartner = await prisma.referralPartner.update({
      where: { id: partnerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        upiId: true,
        address: true,
        referralCode: true,
        kycStatus: true, // Good to return status here too
      },
    });

    res.json({
      message: "Profile updated successfully",
      partner: updatedPartner,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
