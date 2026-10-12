import prisma from "../prismaClient.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| ADMIN REGISTER SERVICE
|--------------------------------------------------------------------------
*/
export const registerAdminService = async ({ name, email, password }) => {
  try {
    // Safety gate
    if (process.env.ALLOW_ADMIN_REGISTER !== "true") {
      throw new Error("Admin registration is disabled");
    }

    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      throw new Error("Admin already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    // Generate JWT
    const token = generateToken({
      id: admin.id,
      role: admin.role,
      type: "ADMIN",
    });

    return {
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("Register Admin Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN SERVICE
|--------------------------------------------------------------------------
*/
export const loginAdminService = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, admin.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    id: admin.id,
    role: admin.role,
    type: "ADMIN",
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

/*
|--------------------------------------------------------------------------
| PARTNER REGISTER SERVICE
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| PARTNER REGISTER SERVICE (UPDATED)
|--------------------------------------------------------------------------
*/
export const registerPartnerService = async ({
  name,
  email,
  phone,
  password,
  upiId,
  address,
}) => {
  // 1. Validation
  if (!name || !email || !phone || !password || !upiId || !address) {
    throw new Error("All fields are required");
  }

  // 2. Check if email already exists
  const existing = await prisma.referralPartner.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already registered");
  }

  // 3. Hash Password
  const hashedPassword = await hashPassword(password);

  // 4. Generate a UNIQUE Referral Code
  let referralCode;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    // Generate code
    referralCode = `PARTNER_${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Check database for existence
    const existingCode = await prisma.referralPartner.findUnique({
      where: { referralCode },
    });

    if (!existingCode) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Could not generate a unique referral code. Please try again.");
  }

  // 5. Create Partner
  const partner = await prisma.referralPartner.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      upiId,
      address,
      referralCode,
    },
  });

  // 6. Generate Token
  const token = generateToken({
    id: partner.id,
    role: "PARTNER",
    type: "PARTNER",
  });

  return {
    token,
    partner: {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      referralCode: partner.referralCode,
    },
  };
};

/*
|--------------------------------------------------------------------------
| PARTNER LOGIN SERVICE (UPDATED)
|--------------------------------------------------------------------------
*/
export const loginPartnerService = async ({ email, password }) => {
  // 1. Basic Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // 2. Find Partner by email
  const partner = await prisma.referralPartner.findUnique({
    where: { email: email.toLowerCase() }, // Normalize email
  });

  // 3. Security: Use a generic error for "Not Found" to prevent email harvesting
  if (!partner) {
    throw new Error("Invalid email or password");
  }

  // 4. Check if Account is Active (Handled before password check for efficiency)
  if (!partner.isActive) {
    throw new Error("Your partner account has been deactivated. Please contact support.");
  }

  // 5. Verify Password
  const isMatch = await comparePassword(password, partner.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 6. Generate JWT Token
  // We include 'type' to distinguish from regular Garage Users in the middleware
  const token = generateToken({
    id: partner.id,
    role: "PARTNER",
    type: "PARTNER", 
  });

  // 7. Return consistent data structure
  return {
    token,
    partner: {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      referralCode: partner.referralCode,
    },
  };
};