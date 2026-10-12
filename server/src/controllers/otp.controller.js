// controllers/otp.controller.js
import prisma from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const otpStore = new Map();

import { sendOTPEmail } from "../services/emailService.js";

const normalizePhone = (phone) => phone.replace(/\D/g, "");
const normalizeEmail = (email) => email?.trim().toLowerCase();

// ===================== PHONE OTP =====================

export const sendOtp = async (req, res, next) => {
  try {
    let { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    phone = normalizePhone(phone);
    if (!phone.startsWith("91")) phone = "91" + phone;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    const message = `${otp} is your OTP for Abacco Technology CRM login verification. OTP valid for 10 minutes. Do not share this OTP with anyone.`;
    const smsUrl = "https://www.smsgatewayhub.com/api/mt/SendSMS";

    const params = {
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
    };

    const { data } = await axios.get(smsUrl, { params });

    if (data?.ErrorCode !== "000") {
      return res.status(500).json({
        success: false,
        message: data?.ErrorMessage || "Failed to send OTP",
      });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Exception:", err?.response?.data || err.message);
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    let { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    phone = normalizePhone(phone);
    if (!phone.startsWith("91")) phone = "91" + phone;

    const record = otpStore.get(phone);
    if (!record)
      return res.status(400).json({ success: false, message: "OTP not found" });
    if (record.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    otpStore.delete(phone);

    let user = await prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      // Brand new phone signup — no name yet, frontend will ask for it
      user = await prisma.user.create({
        data: {
          phone,
          role: "BUYER",
          isVerified: true,
        },
      });
      isNewUser = true;
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
