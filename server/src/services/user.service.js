//user.service.js
import prisma from "../config/db.js";
import {
  buildProfileUpdate,
  clientUserSelect,
  toClientUser,
} from "../utils/userProfile.js";

export const getCurrentUserService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: clientUserSelect,
  });
  return toClientUser(user);
};

// Only whitelisted profile fields can change (name / email / dob) — never role etc.
export const updateUserService = async (userId, body) => {
  const data = await buildProfileUpdate(userId, body);
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: clientUserSelect,
  });
  return toClientUser(user);
};

// Check user role by email - returns user info including role
// If user doesn't exist, returns default BUYER role
export const checkUserRoleService = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      isBlocked: true,
    },
  });

  if (!user) {
    // User doesn't exist - return default BUYER role info
    return {
      exists: false,
      role: "BUYER",
      email: email,
      message: "New user will be created with BUYER role",
    };
  }

  // User exists - return their actual role
  return {
    exists: true,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    isVerified: user.isVerified,
    isActive: user.isActive,
    isBlocked: user.isBlocked,
  };
};
