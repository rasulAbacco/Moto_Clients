import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY, GUEST_VEHICLE_KEY } from "./vehicle.constants";

// Active vehicle
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

// Guest vehicle
export const setGuestVehicle = async (vehicle) => {
  await AsyncStorage.setItem(GUEST_VEHICLE_KEY, JSON.stringify(vehicle));
};

export const getGuestVehicle = async () => {
  const data = await AsyncStorage.getItem(GUEST_VEHICLE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearGuestVehicle = async () => {
  await AsyncStorage.removeItem(GUEST_VEHICLE_KEY);
};
