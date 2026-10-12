import {
  registerPartnerService,
  loginPartnerService,
} from "../../services/auth.service.js";

export const partnerRegister = async (req, res) => {
  try {
    const result = await registerPartnerService(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const partnerLogin = async (req, res) => {
  try {
    const result = await loginPartnerService(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
