// controllers/otp.controller.js
import prisma from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

const otpStore = new Map(); // temporary memory storage

// helper to normalize phone
const normalizePhone = (phone) => {
  return phone.replace(/\D/g, ""); // remove +, spaces, etc.
};

export const sendOtp = async (req, res, next) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    phone = normalizePhone(phone);

    // generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store OTP
    otpStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    console.log("OTP SAVED:", phone, otp);

    // DEV mode response
    res.json({
      success: true,
      otp,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    let { phone, name, email, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    phone = normalizePhone(phone);

    console.log("VERIFY REQUEST:", phone, otp);

    const record = otpStore.get(phone);

    if (!record) {
      console.log("OTP STORE:", otpStore);
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (record.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified
    otpStore.delete(phone);

    // find user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          phone,
          email,
        },
      });
    }

    // generate token
    const token = generateToken({ userId: user.id });

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export { otpStore };
