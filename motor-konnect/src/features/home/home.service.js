import api from "../../services/apiClient";

export const fetchMainServices = async () => {
  const res = await api.get("/services");
  return res.data;
};
