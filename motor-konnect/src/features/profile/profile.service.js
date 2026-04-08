import api from "../../services/apiClient";

const updateProfile = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  return data;
};

export default {
  updateProfile,
};
