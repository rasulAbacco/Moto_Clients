//auth.service.js
import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/generateToken.js";

export const registerService = async (data) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) throw new Error("Email already registered");

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
    },
  });

  const token = generateToken({ userId: user.id });

  return { user, token };
};

export const loginService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);

  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ userId: user.id });

  return { user, token };
};
