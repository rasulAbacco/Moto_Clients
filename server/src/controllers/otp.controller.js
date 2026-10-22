// controllers/otp.controller.js
import prisma from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const otpStore = new Map(); // kept for backwards compatibility (no longer used)

import { sendOTPEmail } from "../services/emailService.js";

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");
const normalizeEmail = (email) => email?.trim().toLowerCase();

// 10-digit Indian mobile, from "+91 98450 12345" / "919845012345" / "9845012345"
const tenDigits = (phone) => normalizePhone(phone).slice(-10);
const isValidMobile = (ten) => /^[6-9]\d{9}$/.test(ten);
// Stored format (same as before): 91XXXXXXXXXX
const toStoredPhone = (ten) => `91${ten}`;

const PHONE_OTP_MINUTES = 10; // matches the DLT SMS text ("valid for 10 minutes")

// ===================== PHONE OTP (Motor Konnect app) =====================
// OTPs are kept (hashed) in the OTP table instead of server memory, so they
// survive a server restart / Render sleep between "send" and "verify".

export const sendOtp = async (req, res, next) => {
  try {
    const ten = tenDigits(req.body?.phone);
    if (!ten) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number required" });
    }
    if (!isValidMobile(ten)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a valid 10-digit mobile number",
        });
    }
    const phone = toStoredPhone(ten);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // DLT-registered template — must stay word-for-word the same
    const message = `${otp} is your OTP for Abacco Technology CRM login verification. OTP valid for 10 minutes. Do not share this OTP with anyone.`;
    const { data } = await axios.get(
      "https://www.smsgatewayhub.com/api/mt/SendSMS",
      {
        params: {
          APIKey: process.env.SMS_API_KEY,
          senderid: process.env.SMS_SENDER_ID,
          channel: 2,
          DCS: 0,
          flashsms: 0,
          number: phone,
          text: message,
          route: process.env.SMS_ROUTE,
          EntityId: process.env.SMS_ENTITY_ID,
          dlttemplateid: process.env.SMS_TEMPLATE_ID,
        },
        timeout: 15000,
      },
    );

    if (data?.ErrorCode !== "000") {
      console.error("SMS gateway error:", data?.ErrorCode, data?.ErrorMessage);
      return res.status(502).json({
        success: false,
        message:
          data?.ErrorMessage || "Could not send OTP SMS. Please try again.",
      });
    }

    // Only store the OTP once the SMS actually went out
    await prisma.oTP.deleteMany({ where: { mobile: phone, verified: false } });
    await prisma.oTP.create({
      data: {
        mobile: phone,
        otp: await bcrypt.hash(otp, 10),
        expiresAt: new Date(Date.now() + PHONE_OTP_MINUTES * 60 * 1000),
        verified: false,
      },
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Exception:", err?.response?.data || err.message);
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const ten = tenDigits(req.body?.phone);
    const otp = String(req.body?.otp || "").trim();
    if (!ten || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP required" });
    }
    const phone = toStoredPhone(ten);

    const record = await prisma.oTP.findFirst({
      where: { mobile: phone, verified: false },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP not found. Please request a new OTP.",
        });
    }
    if (record.expiresAt < new Date()) {
      await prisma.oTP.delete({ where: { id: record.id } }).catch(() => {});
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP expired. Please request a new OTP.",
        });
    }
    if (!(await bcrypt.compare(otp, record.otp))) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    await prisma.oTP.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Optional details from the app's login form
    const name = String(req.body?.name || req.body?.fullName || "").trim();
    const email = normalizeEmail(req.body?.email || "");
    const emailOk = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Existing user? Phone may be stored as 91XXXXXXXXXX or as the 10 digits
    let user = await prisma.user.findFirst({
      where: { phone: { in: [phone, ten, `+91${ten}`] } },
    });
    let isNewUser = false;

    // Only use the email if no other account already has it
    const emailFree = async (exceptId) =>
      emailOk &&
      !(await prisma.user.findFirst({
        where: { email, ...(exceptId && { id: { not: exceptId } }) },
        select: { id: true },
      }));

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          fullName: name || null,
          email: (await emailFree()) ? email : null, // email is optional
          role: "BUYER",
          isVerified: true,
        },
      });
      isNewUser = true;
    } else {
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ success: false, message: "Your account has been blocked." });
      }
      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Your account is inactive." });
      }
      // Fill in blanks only — never overwrite what the user already has
      const updateData = { isVerified: true };
      if (name && !user.fullName?.trim()) updateData.fullName = name;
      if (!user.email && (await emailFree(user.id))) updateData.email = email;
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    const needsFullName = !user.fullName?.trim();
    const token = generateToken({ userId: user.id });

    res.json({
      success: true,
      token,
      isNewUser,
      needsFullName,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    next(err);
  }
};

// ===================== LOGIN ROUTES (/auth/send-otp, /auth/verify-otp) =====================
// The Motor Konnect app logs in with PHONE (email is optional).
// Requests that send only an email (no phone) still get the email OTP flow.

export const sendLoginOtp = (req, res, next) => {
  if (req.body?.phone) return sendOtp(req, res, next);
  if (req.body?.email) return sendEmailOTP(req, res);
  return res
    .status(400)
    .json({ success: false, message: "Phone number required" });
};

export const verifyLoginOtp = (req, res, next) => {
  if (req.body?.phone) return verifyOtp(req, res, next);
  if (req.body?.email) return verifyEmailOTP(req, res);
  return res
    .status(400)
    .json({ success: false, message: "Phone and OTP required" });
};

export { otpStore };

// ===================== EMAIL OTP =====================

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => bcrypt.hash(otp, 10);
const compareOTP = (otp, hash) => bcrypt.compare(otp, hash);

const generateAccessToken = (user) =>
  // Create access token without `exp` so it doesn't expire until session is revoked
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
  );

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const getRefreshExpiry = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const sendEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000,
    );

    await prisma.oTP.deleteMany({ where: { email, verified: false } });

    await prisma.oTP.create({
      data: { email, mobile: "", otp: otpHash, expiresAt, verified: false },
    });

    await sendOTPEmail({ email, otp });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to send OTP" });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    // fullName is only used when the frontend is on the NAME step (existing session, adding name)
    const fullNameInput = String(req.body.fullName || "").trim();

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }
    if (otpRecord.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired." });
    }

    const isValid = await compareOTP(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    let user = await prisma.user.findUnique({
      where: { email },
      include: { sellerProfile: true },
    });
    let isNewUser = false;

    if (!user) {
      // Brand new email signup — created WITHOUT fullName; frontend asks for it next.
      user = await prisma.user.create({
        data: {
          email,
          fullName: fullNameInput || null, // usually empty on first verify
          role: "BUYER",
          isVerified: true,
          isActive: true,
          isBlocked: false,
        },
        include: { sellerProfile: true },
      });
      isNewUser = true;
    } else {
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ success: false, message: "Your account has been blocked." });
      }
      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Your account is inactive." });
      }

      const updateData = { isVerified: true };
      // If the frontend called this again from the NAME step with a name, persist it now.
      if (fullNameInput && !user.fullName?.trim()) {
        updateData.fullName = fullNameInput;
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        include: { sellerProfile: true },
      });
    }

    const needsFullName = !user.fullName?.trim();
    const isSellerRegistered = !!user.sellerProfile;
    const isSellerApproved =
      user.sellerProfile?.verificationStatus === "APPROVED";

    const token = generateToken({ userId: user.id });
    console.log("User Token:", token);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      isNewUser,
      needsFullName,
      isSellerRegistered,
      isSellerApproved,
      token,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { fullName, lastName, phone } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "fullName name is required",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: fullName.trim(),
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    return res.json({
      success: true,
      message: "Profile completed successfully",

      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isSeller: user.isSeller,
        sellerApproved: user.sellerApproved,
      },
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete profile",
    });
  }
};
