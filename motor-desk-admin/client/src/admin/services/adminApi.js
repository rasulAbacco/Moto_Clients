import axios from "axios";

/**
 * Base API Instance
 */
const adminApi = axios.create({
  baseURL:
    import.meta.env.VITE_ADMIN_API_URL || "http://localhost:8000/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically attach token if exists
 */
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * ============================
 * AUTH APIs
 * ============================
 */

export const loginAdmin = (data) => adminApi.post("/login", data);

export const registerAdmin = (data) => adminApi.post("/register", data);

/**
 * ============================
 * DASHBOARD
 * ============================
 */

export const getDashboardStats = () => adminApi.get("/dashboard");

/**
 * ============================
 * USERS
 * ============================
 */

export const getUsers = () => adminApi.get("/users");

export const getUserById = (id) => adminApi.get(`/users/${id}`);

/**
 * ============================
 * PARTNERS
 * ============================
 */

export const getPartners = () => adminApi.get("/partners");

export const getPartnerById = (id) => adminApi.get(`/partners/${id}`);

export const updatePartnerStatus = (id, data) =>
  adminApi.put(`/partners/${id}/status`, data);

/**
 * ============================
 * REFERRALS
 * ============================
 */

export const getReferrals = () => adminApi.get("/referrals");

/**
 * ============================
 * PAYOUTS
 * ============================
 */

export const getPayouts = () => adminApi.get("/payouts");

export const markPayoutPaid = (id, data) =>
  adminApi.put(`/payouts/${id}/mark-paid`, data);

/**
 * ============================
 * SETTINGS
 * ============================
 */

export const getReferralSettings = () => adminApi.get("/settings");

export const updateReferralSettings = (data) => adminApi.put("/settings", data);

//////////////////////////////////////////////////////////

/**
 * ============================
 * SELLERS (Verification & Oversight)
 * ============================
 */

export const getAllSellers = (params) => adminApi.get("/sellers", { params });

export const getSellerDetail = (sellerId) =>
  adminApi.get(`/sellers/${sellerId}`);

export const markSellerUnderReview = (sellerId) =>
  adminApi.patch(`/sellers/${sellerId}/under-review`);

export const approveSellerProfile = (sellerId) =>
  adminApi.patch(`/sellers/${sellerId}/approve`);

export const verifySellerDocument = (documentId, data) =>
  adminApi.patch(`/seller-documents/${documentId}/verify`, data);

/**
 * ============================
 * VEHICLES (Verification Queue)
 * ============================
 */

export const getVehiclesForVerification = (params) =>
  adminApi.get("/vehicles/pending", { params });

/**
 * ============================
 * FIELD INSPECTORS
 * ============================
 */

export const createFieldInspector = (data) =>
  adminApi.post("/inspectors", data);

export const updateFieldInspector = (id, data) =>
  adminApi.put(`/inspectors/${id}`, data);

export const deleteFieldInspector = (id) =>
  adminApi.delete(`/inspectors/${id}`);

export const toggleFieldInspectorStatus = (id) =>
  adminApi.patch(`/inspectors/${id}/toggle`);

export const getAvailableInspectors = (params) =>
  adminApi.get("/inspectors", { params });

export const getInspectorAssignments = (inspectorId) =>
  adminApi.get("/inspections", { params: { inspectorId, limit: 100 } });

/**
 * ============================
 * INSPECTIONS (Assign / Monitor / Verify)
 * ============================
 */

export const assignInspection = (data) =>
  adminApi.post("/inspections/assign", data);

export const getAllInspections = (params) =>
  adminApi.get("/inspections", { params });

export const getInspectionDetail = (id) => adminApi.get(`/inspections/${id}`);

export const finalVerifyVehicle = (id, data) =>
  adminApi.patch(`/inspections/${id}/verify`, data);

/**
 * ============================
 * ADMIN NOTIFICATIONS
 * ============================
 */

export const getAdminNotifications = () => adminApi.get("/notifications");

export const markAllAdminNotificationsRead = () =>
  adminApi.patch("/notifications/read-all");

export default adminApi;
