const fallbackBaseUrl = "http://192.168.0.3:8000/api/v1";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL || fallbackBaseUrl;
