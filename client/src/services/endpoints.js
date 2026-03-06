export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    ME: "/auth/me",
  },
  GARAGES: {
    LIST: "/garages",
    DETAILS: (id) => `/garages/${id}`,
  },
  BOOKINGS: {
    CREATE: "/bookings",
    LIST: "/bookings",
  },
};
