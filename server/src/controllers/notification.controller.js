// src/controllers/notification.controller.js
// App-facing controller — reads AppNotification from CRM DB (MOTO_DB_URL)
// Mirrors the pattern used in package.controller.js

import pkg from "pg";
const { Pool } = pkg;

// ✅ CRM DB (source of truth — same as package.controller.js)
const db = new Pool({
  connectionString: process.env.MOTO_DB_URL,
});

// ==============================
// Icon map: iconKey (stored in CRM) → Ionicon name (used in app)
// ==============================
const ICON_MAP = {
  car: "car-outline",
  package: "cube-outline",
  shield: "shield-checkmark-outline",
  wallet: "wallet-outline",
  offer: "pricetag-outline",
  alert: "alert-circle-outline",
  bell: "notifications-outline",
  check: "checkmark-circle-outline",
};

const resolveIcon = (iconKey, type) => {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey];
  // Fallback by notification type
  switch (type) {
    case "BOOKING_ACCEPTED":  return "checkmark-circle-outline";
    case "BOOKING_REJECTED":  return "close-circle-outline";
    case "NEW_PACKAGE":       return "cube-outline";
    default:                  return "notifications-outline";
  }
};

const resolveIconColor = (iconKey, type) => {
  if (type === "BOOKING_ACCEPTED") return "#16a34a";
  if (type === "BOOKING_REJECTED") return "#ef4444";
  if (type === "NEW_PACKAGE")      return "#7c3aed";
  switch (iconKey) {
    case "car":     return "#7c3aed";
    case "wallet":  return "#16a34a";
    case "offer":   return "#ef4444";
    case "alert":   return "#f97316";
    case "shield":  return "#b91c1c";
    default:        return "#0ea5e9";
  }
};

// ==============================
// GET /api/notifications
// ?phone=919876543210  (optional)
//
// Returns:
//   - All GLOBAL notifications (scope = 'GLOBAL')  → shown to every user
//   - USER-scoped notifications for this phone       → booking accepted/rejected
// ==============================
export const getNotifications = async (req, res) => {
  try {
    const { phone } = req.query;

    const result = await db.query(
      `
      SELECT
        n.id,
        n.type,
        n.title,
        n.body,
        n."iconKey",
        n.scope,
        n."clientPhone",
        n."bookingId",
        n."packageId",
        n."isActive",
        n."createdAt",
        u."companyName" as "garageName"

      FROM "AppNotification" n

      LEFT JOIN "User" u
        ON u.id = n."createdByUserId"

      WHERE n."isActive" = true
        AND (
          n.scope = 'GLOBAL'
          ${phone ? `OR (n.scope = 'USER' AND n."clientPhone" = $1)` : ""}
        )

      ORDER BY n."createdAt" DESC

      LIMIT 50
      `,
      phone ? [phone] : [],
    );

    console.log("RAW createdAt:", result.rows[0]?.createdAt, typeof result.rows[0]?.createdAt);


    // Shape data for the app's NotificationPanel
 const notifications = result.rows.map((n) => {

  // 🔥 ADD THESE LOGS HERE
  console.log("NOW:", new Date().toISOString());
  console.log("CREATED:", n.createdAt);

  return {
    id:        String(n.id),
    type:      n.type,
    icon:      resolveIcon(n.iconKey, n.type),
    iconColor: resolveIconColor(n.iconKey, n.type),
    iconBg:    resolveIconColor(n.iconKey, n.type) + "15",
    title:     n.title,
    body:      n.body,
    time:      formatTime(n.createdAt),
    unread:    false,
    scope:     n.scope,
    garageName: n.garageName || null,
    bookingId:  n.bookingId   || null,
    packageId:  n.packageId   || null,
    createdAt:  n.createdAt,
  };
});

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// Helpers
// ==============================
function formatTime(date) {
  if (!date) return "";

  // Convert both times to IST
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const nowIST = Date.now() + IST_OFFSET;
  const createdIST = new Date(date).getTime() + IST_OFFSET;

  const diff = nowIST - createdIST;

  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(createdIST).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}