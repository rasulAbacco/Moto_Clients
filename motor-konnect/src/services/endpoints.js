//endpoints.js
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    ME: "/auth/me",
    VEHICLES: "/auth/vehicles",
  },
  GARAGES: {
    LIST: "/garages",
    DETAILS: (id) => `/garages/${id}`,
  },
  BOOKINGS: {
    CREATE: "/bookings",
    LIST: "/bookings",
  },
  MARKETPLACE: {
    SERVICES: "/marketplace/services",
    PACKAGES: "/packages",

    // 🆕 Real booking endpoints (these already exist and work on the server —
    // the app just wasn't calling them).
    BOOK: "/marketplace/book",
    MY_BOOKINGS: "/marketplace/my-bookings",
    CLIENT_LOOKUP: "/marketplace/client-lookup",
  },

  // 🆕 Used for the accept/reject notification poll fallback on the confirm screen
  NOTIFICATIONS: {
    LIST: "/notifications",
  },
};
