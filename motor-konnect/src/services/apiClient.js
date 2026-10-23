// apiClient.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Which server the app talks to.
// Set EXPO_PUBLIC_MAIN_API_URL in motor-konnect/.env, e.g.
//   EXPO_PUBLIC_MAIN_API_URL=https://t3kkdxqs-8000.inc1.devtunnels.ms/api   (local server via dev tunnel)
//   EXPO_PUBLIC_MAIN_API_URL=https://moto-clients.onrender.com/api          (deployed server)
// (Separate from EXPO_PUBLIC_API_URL, which other screens use with /api/v1.)
// then restart Expo with `npx expo start -c` (env values are read at bundle time).
// Without it, the deployed Render server is used.
const DEFAULT_API_URL = "https://moto-clients.onrender.com/api";

export const API_URL = (
  process.env.EXPO_PUBLIC_MAIN_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

if (__DEV__) console.log("API base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  // Render's free plan can take 30s+ to wake up. A short timeout made the app
  // give up while the server was still working (OTP "not found" on retry,
  // profile "Something went wrong", vehicles not loading).
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Retry GET requests once when the server is waking up / busy or the
// connection dropped. (POST/PUT are not retried automatically.)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
api.interceptors.response.use(undefined, async (error) => {
  const config = error?.config;
  const status = error?.response?.status;
  const retryable =
    !error?.response || // timeout / no signal
    status === 502 ||
    status === 503 ||
    status === 504;

  if (
    config &&
    retryable &&
    (config.method || "get").toLowerCase() === "get" &&
    !config._retried
  ) {
    config._retried = true;
    await wait(1500);
    return api(config);
  }
  return Promise.reject(error);
});

/** A readable message for any failed request */
export const apiErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => {
  const data = err?.response?.data;
  if (data?.errors?.length && data.errors[0]?.message)
    return data.errors[0].message;
  if (typeof data?.message === "string" && data.message) return data.message;
  if (err?.code === "ECONNABORTED")
    return "The server is taking too long to respond. Please try again.";
  if (!err?.response)
    return "Can't reach the server. Check your internet connection and try again.";
  return fallback;
};

export default api;
