// providers/AuthProvider.jsx
//
// Login stays until the user taps Log out (like Instagram):
// - the token is kept in SecureStore and never expires on the server
// - the last profile is cached on the phone, so on app start the user is
//   shown as logged in straight away, even offline or while the server wakes up
// - the profile is refreshed in the background (on start and when the app
//   comes back to the foreground)
// - the user is only logged out if the server says the token is invalid
//   (401) — never because of a timeout, no signal or a server error
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/apiClient";
import { ENDPOINTS } from "../services/endpoints";
import { setToken, removeToken, getToken } from "../services/storage.service";
import { fetchProfileImage } from "../services/profileImage.service";
import {
  getGuestVehicle,
  clearGuestVehicle,
} from "../features/vehicle/vehicle.service";

export const AuthContext = createContext();

const USER_CACHE_KEY = "MK_USER_CACHE";

const cacheUser = async (u) => {
  try {
    if (u) await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(USER_CACHE_KEY);
  } catch {}
};

const readCachedUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const loggedIn = useRef(false);

  const setUser = useCallback((u) => {
    loggedIn.current = Boolean(u);
    setUserState(u);
    cacheUser(u);
  }, []);

  const loadAvatar = useCallback(async () => {
    try {
      setAvatarUrl(await fetchProfileImage());
    } catch {
      // keep the current photo if this request fails
    }
  }, []);

  // ===============================
  // Log out (only place the session is cleared, apart from a 401)
  // ===============================
  const logout = useCallback(async () => {
    await removeToken();
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    setAvatarUrl(null);
  }, [setUser]);

  // ===============================
  // Fetch Profile — refreshes the user; logs out only on 401
  // ===============================
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      // Backend returns { success: true, data: { ...user, address, vehicles } }
      if (data?.data) setUser(data.data);
      return data?.data ?? null;
    } catch (error) {
      if (error.response?.status === 401) {
        await logout(); // token is no longer valid
        return null;
      }
      // Timeout / offline / server error → stay logged in with cached data
      if (__DEV__)
        console.log(
          "fetchProfile failed (still logged in):",
          error.response?.status || error.message,
        );
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout, setUser]);

  // ===============================
  // Email / Password Login
  // ===============================
  const login = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    await setToken(data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  // ===============================
  // Send OTP
  // ===============================
  const sendOtp = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.SEND_OTP, payload);
    return data;
  };

  // ===============================
  // Verify OTP
  // ===============================
  const verifyOtp = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, payload);

    await setToken(data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

    // Logged in now — don't make the user wait for the full profile
    setUser({ ...(data.user || {}), vehicles: [] });

    // Then save the vehicle they picked as a guest and load the full profile
    (async () => {
      await syncGuestVehicle();
      await fetchProfile();
      loadAvatar();
    })();

    return data;
  };

  // ===============================
  // Update Profile
  // Body: { name, email, dob, address: { street, city, state, postalCode, country } }
  // ===============================
  const updateProfile = async (payload) => {
    const { data } = await api.put(ENDPOINTS.AUTH.ME, payload);
    // Keep vehicles from the current state if the response doesn't include them
    setUserState((prev) => {
      const next = { ...(prev || {}), ...(data.data || {}) };
      if (!data.data?.vehicles?.length && prev?.vehicles)
        next.vehicles = prev.vehicles;
      cacheUser(next);
      return next;
    });
    return data.data;
  };

  const syncGuestVehicle = async () => {
    try {
      const guestVehicle = await getGuestVehicle();

      if (!guestVehicle?.brand || !guestVehicle?.model) return;

      await api.post(ENDPOINTS.AUTH.VEHICLES, {
        vehicleType: guestVehicle.type ?? "car",
        brandName: guestVehicle.brand.name,
        modelName: guestVehicle.model.name,
        fuelType: guestVehicle.fuelType,
        transmission: guestVehicle.transmission,
      });

      await clearGuestVehicle();
    } catch (err) {
      console.warn(
        "Guest vehicle sync failed:",
        err?.response?.data || err?.message,
      );
    }
  };

  const updateVehicle = async (id, payload) => {
    return api.put(`/auth/vehicles/${id}`, payload);
  };

  // ===============================
  // App start: restore the session
  // ===============================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (!token) {
          await cacheUser(null);
          setLoading(false);
          return;
        }
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const cached = await readCachedUser();
        if (cached) {
          // Show the app as logged in immediately; refresh quietly
          loggedIn.current = true;
          setUserState(cached);
          setLoading(false);
          fetchProfile();
        } else {
          // First start after this update: wait for the profile once.
          const fresh = await fetchProfile();
          if (!fresh && (await getToken())) {
            // Server unreachable but the token is still there → stay logged
            // in; details fill in when the server answers.
            loggedIn.current = true;
            setUserState({ vehicles: [] });
          }
        }
        loadAvatar();
      } catch (e) {
        console.warn("initAuth error:", e);
        setLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when the app comes back to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && loggedIn.current) fetchProfile();
    });
    return () => sub.remove();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        sendOtp,
        verifyOtp,
        logout,
        fetchProfile,
        updateProfile,
        updateVehicle,
        avatarUrl,
        setAvatarUrl,
        loadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
