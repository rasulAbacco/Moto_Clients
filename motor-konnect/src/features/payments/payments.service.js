import api from "../../services/apiClient";
import { ENDPOINTS } from "../../services/endpoints";

const createPayment = async (payload) => {
  const { data } = await api.post("/payments", payload);
  return data;
};

export default {
  createPayment,
};
