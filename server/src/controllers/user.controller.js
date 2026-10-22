//user.controller.js
import {
  getCurrentUserService,
  updateUserService,
  checkUserRoleService,
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
    if (err?.status && err.name !== "PrismaClientKnownRequestError") {
      return res
        .status(err.status)
        .json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Check user role by email - used for dashboard redirection after login
// Returns user's role if exists, or default BUYER role if new user
export const checkUserRole = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userRole = await checkUserRoleService(email.toLowerCase());

    res.json({
      success: true,
      data: userRole,
    });
  } catch (err) {
    next(err);
  }
};
