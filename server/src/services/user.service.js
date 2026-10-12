//user.service.js
import prisma from "../config/db.js";

export const getCurrentUserService = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateUserService = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });
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
