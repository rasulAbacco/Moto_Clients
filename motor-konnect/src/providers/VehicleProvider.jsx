import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/apiClient";
import { AuthContext } from "./AuthProvider";

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    try {
      // 🔹 Logged-in user → fetch from backend
      if (user) {
        const res = await api.get("/auth/vehicles");

        const list = res.data?.data || [];

        setVehicles(list);

        if (list.length > 0) {
          setSelectedVehicle(list[0]);
        }

        return;
      }

      // 🔹 Guest user → load from AsyncStorage
      const storedSelected = await AsyncStorage.getItem("SELECTED_VEHICLE");

      if (storedSelected) {
        const vehicle = JSON.parse(storedSelected);

        setVehicles([vehicle]);
        setSelectedVehicle(vehicle);
      }
    } catch (error) {
      console.error("Vehicle load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle) => {
    try {
      const updated = [...vehicles, vehicle];

      setVehicles(updated);
      setSelectedVehicle(vehicle);

      await AsyncStorage.setItem("USER_VEHICLES", JSON.stringify(updated));
      await AsyncStorage.setItem("SELECTED_VEHICLE", JSON.stringify(vehicle));
    } catch (error) {
      console.error("Add vehicle error:", error);
    }
  };

  const changeVehicle = async (vehicle) => {
    try {
      setSelectedVehicle(vehicle);
      await AsyncStorage.setItem("SELECTED_VEHICLE", JSON.stringify(vehicle));
    } catch (error) {
      console.error("Change vehicle error:", error);
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        addVehicle,
        changeVehicle,
        loading,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};
