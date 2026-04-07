import multer from "multer";

// ✅ Store file in memory (BUFFER) instead of disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  // (optional but recommended)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});