// apiClient.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBaseURL = () => {
  if (Platform.OS === "android") {
    // Android Emulator
    // return "https://cqw6v494-8000.inc1.devtunnels.ms/api";
    return "https://ld3bgq17-8000.inc1.devtunnels.ms/api";
  }

  // iOS Simulator
  // return "https://cqw6v494-8000.inc1.devtunnels.ms/api";
  return "https://ld3bgq17-8000.inc1.devtunnels.ms/api";
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
