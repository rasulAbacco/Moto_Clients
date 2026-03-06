import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBaseURL = () => {
  if (Platform.OS === "android") {
    // Android Emulator
    return "http://10.0.2.2:8000/api";
  }

  // iOS Simulator
  return "http://localhost:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
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
