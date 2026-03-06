//user.controller.js
import {
  getCurrentUserService,
  updateUserService,
} from "../services/user.service.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await getCurrentUserService(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserService(req.user.id, req.body);

    res.json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
