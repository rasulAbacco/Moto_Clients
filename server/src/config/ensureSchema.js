// server/src/config/ensureSchema.js
//
// Makes sure the database has the columns the Motor Konnect app needs, every
// time the server starts. All statements are safe to run again and again.
//
// Why: the User table is shared with another project. If that project runs
// `prisma db push` with its own schema, it can drop these columns (dob,
// profileImage, ...) or make email required again. When that happens every
// User query fails (login says "OTP not found" on retry, profile won't save,
// the app looks logged out). Running this on start-up repairs it
// automatically, without anyone having to run a migration by hand.
import prisma from "./db.js";

const STATEMENTS = [
  // Motor Konnect profile fields
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dob" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileImage" BYTEA`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileImageType" TEXT`,
  // App users sign up with phone only — email must stay optional
  `ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL`,
  // OTP rows for phone and email logins
  `ALTER TABLE "OTP" ADD COLUMN IF NOT EXISTS "mobile" TEXT`,
  `ALTER TABLE "OTP" ADD COLUMN IF NOT EXISTS "email" TEXT`,
  `ALTER TABLE "OTP" ALTER COLUMN "mobile" DROP NOT NULL`,
];

let running = null;

export function ensureAppSchema() {
  if (running) return running;
  running = (async () => {
    for (const sql of STATEMENTS) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (err) {
        // A table might not exist yet on a brand-new database — not fatal
        console.warn("ensureAppSchema:", sql, "→", err.message);
      }
    }
    console.log("✅ Database columns for Motor Konnect checked");
  })().finally(() => {
    // allow another run later (e.g. after the shared schema was pushed again)
    setTimeout(() => {
      running = null;
    }, 30_000);
  });
  return running;
}

/** Prisma "column does not exist" — the schema was changed under us */
export const isMissingColumnError = (err) =>
  err?.code === "P2022" ||
  /column .* does not exist/i.test(String(err?.message || ""));
