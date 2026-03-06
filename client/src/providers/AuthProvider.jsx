// providers/AuthProvider.jsx
import { createContext, useEffect, useState, useContext } from "react";
import api from "../services/apiClient";
import { ENDPOINTS } from "../services/endpoints";
import { setToken, removeToken, getToken } from "../services/storage.service";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 1️⃣ Email / Password Login
  // ===============================
  const login = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    await setToken(data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  // ===============================
  // 2️⃣ Send OTP
  // ===============================
  const sendOtp = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.SEND_OTP, payload);
    return data;
  };

  // ===============================
  // 3️⃣ Verify OTP
  // ===============================
  const verifyOtp = async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, payload);
    await setToken(data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  // ===============================
  // 4️⃣ Logout
  // ===============================
  const logout = async () => {
    await removeToken();
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  // ===============================
  // 5️⃣ Fetch Profile
  // ===============================
  const fetchProfile = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      // Backend returns { success: true, data: { ...user, address, vehicles } }
      setUser(data.data);
      return data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await removeToken();
        delete api.defaults.headers.common.Authorization;
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 6️⃣ Update Profile
  // Body: { name, email, dob, company, taxNumber, registrationNumber,
  //         address: { street, city, state, postalCode, country } }
  // ===============================
  const updateProfile = async (payload) => {
    const { data } = await api.put(ENDPOINTS.AUTH.ME, payload);
    // Merge updated data into local state
    setUser(data.data);
    return data.data;
  };

  // ===============================
  // 7️⃣ Auto Fetch On App Start
  // ===============================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          await fetchProfile();
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.warn("initAuth error:", e);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
