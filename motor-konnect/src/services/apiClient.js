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
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
