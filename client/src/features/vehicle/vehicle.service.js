import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "./vehicle.constants";

export const setSelectedVehicle = async (vehicle) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
};

export const getSelectedVehicle = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearSelectedVehicle = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
