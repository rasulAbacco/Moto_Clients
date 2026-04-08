import api from "../../services/apiClient";
import { ENDPOINTS } from "../../services/endpoints";

export const loginRequest = (payload) =>
  api.post(ENDPOINTS.AUTH.LOGIN, payload);

export const registerRequest = (payload) =>
  api.post(ENDPOINTS.AUTH.REGISTER, payload);
