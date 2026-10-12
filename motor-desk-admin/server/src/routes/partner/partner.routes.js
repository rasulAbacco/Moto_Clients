import express from "express";
import {
  partnerRegister,
  partnerLogin,
} from "../../controllers/partner/partner.controller.js";
import { getPartnerDashboard } from "../../controllers/partner/partnerDashboard.controller.js";
import { getPartnerReferrals } from "../../controllers/partner/partnerReferralController.js";
import {
  getPartnerProfile,
  updatePartnerProfile,
} from "../../controllers/partner/partnerProfile.controller.js";
import { getPartnerEarnings } from "../../controllers/partner/partnerEarning.controller.js";
import { updatePartnerKyc } from "../../controllers/partner/patnerKyc.controller.js";
import { verifyPartner } from "../../middleware/partnerAuth.middleware.js";
import { kycUpload } from "../../middleware/kycUpload.js";

const router = express.Router();

router.post("/register", partnerRegister);
router.post("/login", partnerLogin);
router.get("/dashboard", verifyPartner, getPartnerDashboard);
router.get("/referrals", verifyPartner, getPartnerReferrals);
router.get("/profile", verifyPartner, getPartnerProfile);
router.put("/profile", verifyPartner, updatePartnerProfile);
router.get("/earnings", verifyPartner, getPartnerEarnings);
router.put(
  "/kyc-update",
  verifyPartner,
  kycUpload.fields([
    { name: "panDocument", maxCount: 1 },
    { name: "bankProofDocument", maxCount: 1 },
  ]),
  updatePartnerKyc,
);

export default router;
