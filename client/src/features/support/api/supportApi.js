import axios from "axios";

export const sendSupportMessage = async (message) => {
  const res = await axios.post("/support", { message });
  return res.data;
};