import multer from "multer";
import {
  ensureAppSchema,
  isMissingColumnError,
} from "../config/ensureSchema.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Upload problems (profile photo etc.)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Photo is too large. Please choose one under 5 MB."
        : "Could not read the uploaded file.";
    return res.status(400).json({ success: false, message });
  }
  if (err?.message === "Only image files are allowed") {
    return res
      .status(400)
      .json({ success: false, message: "Please choose an image file." });
  }

  // A database column went missing (shared schema was pushed). Repair it in
  // the background; the app retries and the next request works.
  if (isMissingColumnError(err)) {
    ensureAppSchema();
    return res.status(503).json({
      success: false,
      message: "We're updating the server. Please try again in a moment.",
    });
  }

  // Database unreachable (e.g. waking up)
  if (["P1001", "P1002", "P1017", "P2024"].includes(err?.code)) {
    return res.status(503).json({
      success: false,
      message: "Server is busy. Please try again in a moment.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong on our side. Please try again.",
  });
};
