// marketplace.service.js
import api from "./apiClient";
import { ENDPOINTS } from "./endpoints";

export const getMarketplaceServices = (vehicleType) => {
  return api.get(
    `${ENDPOINTS.MARKETPLACE.SERVICES}?vehicleType=${vehicleType}`,
  );
};

export const getServices = async () => {
  const res = await api.get("/marketplace/services");
  return res.data;
};