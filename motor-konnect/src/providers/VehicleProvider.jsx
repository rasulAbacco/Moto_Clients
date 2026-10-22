// providers/VehicleProvider.jsx
//
// Logged in → vehicles from the server (/auth/vehicles), cached on the phone
// so they still show when the server is slow or there's no signal.
// Guest → the vehicle picked during setup (AsyncStorage).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/apiClient";
import { AuthContext } from "./AuthProvider";

export const VehicleContext = createContext();

const CACHE_KEY = "USER_VEHICLES";
const SELECTED_KEY = "SELECTED_VEHICLE";

const readJson = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const VehicleProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  // Re-load when the logged-in user changes or their vehicle count changes
  const userKey = user
    ? `${user.id || "me"}:${user.vehicles?.length ?? ""}`
    : "guest";

  const pickSelected = (list, previous) =>
    list.find((v) => previous && v.id === previous.id) ||
    list.find((v) => v.isPrimary) ||
    list[0] ||
    null;

  const loadVehicles = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    try {
      if (user) {
        // Show cached vehicles straight away
        const cached = await readJson(CACHE_KEY);
        if (id !== requestId.current) return;
        if (Array.isArray(cached) && cached.length) {
          setVehicles(cached);
          setSelectedVehicle((prev) => pickSelected(cached, prev));
          setLoading(false);
        }

        const res = await api.get("/auth/vehicles");
        if (id !== requestId.current) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setVehicles(list);
        setSelectedVehicle((prev) => pickSelected(list, prev));
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list)).catch(() => {});
        return;
      }

      // Guest
      const stored = await readJson(SELECTED_KEY);
      if (id !== requestId.current) return;
      setVehicles(stored ? [stored] : []);
      setSelectedVehicle(stored || null);
    } catch (err) {
      if (id !== requestId.current) return;
      console.log("Vehicle load error:", err?.response?.status || err?.message);
      setError("Couldn't load your vehicles. Pull down to try again.");
      // keep whatever is already shown (cached list)
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return; // wait until we know if the user is logged in
    setLoading(true);
    loadVehicles();
  }, [authLoading, userKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear the cached list on logout
  useEffect(() => {
    if (!authLoading && !user)
      AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  }, [authLoading, user]);

  const addVehicle = async (vehicle) => {
    try {
      const updated = [...vehicles, vehicle];

      setVehicles(updated);
      setSelectedVehicle(vehicle);

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      await AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(vehicle));
    } catch (error) {
      console.error("Add vehicle error:", error);
    }
  };

  const changeVehicle = async (vehicle) => {
    try {
      setSelectedVehicle(vehicle);
      await AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(vehicle));
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
        loading: loading || authLoading,
        error,
        reloadVehicles: loadVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};
