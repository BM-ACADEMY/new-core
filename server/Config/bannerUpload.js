const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directory exists for Banners
const uploadDir = "uploads/banners";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Saves to uploads/banners
  },
  filename: (req, file, cb) => {
    // Unique filename: banner-timestamp.extension
    cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const uploadBanner = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: Limit to 5MB
});

module.exports = uploadBanner;