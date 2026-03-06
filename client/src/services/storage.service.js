//storage.service.js
import * as SecureStore from "expo-secure-store";

export const setToken = async (token) => {
  await SecureStore.setItemAsync("accessToken", token);
};

export const getToken = async () => {
  return SecureStore.getItemAsync("accessToken");
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync("accessToken");
};
