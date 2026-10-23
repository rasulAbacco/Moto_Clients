// server/src/utils/userProfile.js
//
// One place that maps between the database User and what the Motor Konnect app
// expects. The User table was reshaped on 2026-10-12 (name → fullName/lastName,
// email required, dob/profileImage removed) but the app still reads/writes
// `name`, `email`, `dob`. These helpers keep both sides working.
import prisma from "../config/db.js";

/** "Rasul Khan" from fullName + lastName (lastName only if not already included) */
export const displayName = (u) => {
  const first = (u?.fullName || "").trim();
  const last = (u?.lastName || "").trim();
  if (!last || first.toLowerCase().endsWith(last.toLowerCase())) return first;
  return `${first} ${last}`.trim();
};

/** User as sent to the app: adds `name`, never sends password / image bytes */
export const toClientUser = (u) => {
  if (!u) return u;
  // eslint-disable-next-line no-unused-vars
  const { password, profileImage, ...rest } = u;
  return {
    ...rest,
    name: displayName(u) || null,
    hasProfileImage: Boolean(profileImage),
  };
};

/** Fields that may be selected for the app (use with prisma `select`) */
export const clientUserSelect = {
  id: true,
  fullName: true,
  lastName: true,
  email: true,
  phone: true,
  dob: true,
  avatar: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

export class ProfileError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turns an app profile update ({ name, email, dob, ... }) into a safe Prisma
 * `data` object. Only whitelisted fields are copied — role, phone, isBlocked
 * etc. can never be changed from here.
 */
export async function buildProfileUpdate(userId, body = {}) {
  const data = {};

  const name = body.name ?? body.fullName;
  if (name !== undefined) {
    const clean = String(name || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!clean) throw new ProfileError(400, "Name cannot be empty");
    if (clean.length > 80) throw new ProfileError(400, "Name is too long");
    data.fullName = clean;
    data.lastName = null; // whole name lives in fullName (avoids "Rasul Rasul Khan")
  }

  if (body.email !== undefined) {
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      data.email = null; // email is optional
    } else {
      if (!EMAIL_RE.test(email))
        throw new ProfileError(400, "Enter a valid email address");
      const taken = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
        select: { id: true },
      });
      if (taken)
        throw new ProfileError(
          409,
          "This email is already used by another account",
        );
      data.email = email;
    }
  }

  if (body.dob !== undefined) {
    data.dob = String(body.dob || "").trim() || null;
  }

  return data;
}
