const Banner = require("../model/Bannner"); // Ensure this filename matches your actual file
const fs = require("fs");
const path = require("path");

// ==========================================
// HELPER: ROBUST DELETE FUNCTION
// ==========================================
const deleteFile = (fullUrl) => {
  if (!fullUrl) return;

  try {
    // 1. Extract the relative path starting from 'uploads/'
    // Example fullUrl: http://localhost:4000/uploads/banners/banner-123.jpg
    const matches = fullUrl.match(/(uploads\/.*)/);
    
    if (!matches || !matches[1]) {
      console.log("Could not extract relative path from:", fullUrl);
      return;
    }

    const relativePath = matches[1]; // Result: "uploads/banners/banner-123.jpg"

    // 2. Construct absolute path using process.cwd() (Project Root)
    // This is safer than __dirname
    const absolutePath = path.join(process.cwd(), relativePath);

    // 3. Debug logging (Optional: Remove in production)
    console.log("Attempting to delete:", absolutePath);

    // 4. Check and Delete
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("File deleted successfully.");
    } else {
      console.log("File not found at path:", absolutePath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

// ==========================================
// CONTROLLERS
// ==========================================

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, subheading } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    // Construct URL
    const serverUrl = process.env.SERVER_URL;
    const relativePath = req.file.path.replace(/\\/g, "/"); // Fix Windows slashes
    const fullImageUrl = `${serverUrl}/${relativePath}`;

    const newBanner = new Banner({
      title,
      subheading,
      image: fullImageUrl,
    });

    await newBanner.save();

    res.status(201).json({
      message: "Banner created successfully",
      banner: newBanner,
    });
  } catch (error) {
    // Clean up uploaded file if DB save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subheading } = req.body;
    
    let banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Update text fields
    banner.title = title || banner.title;
    banner.subheading = subheading || banner.subheading;

    // Handle Image Update
    if (req.file) {
      // 1. DELETE OLD IMAGE
      if (banner.image) {
        deleteFile(banner.image);
      }

      // 2. SET NEW IMAGE PATH
      const serverUrl = process.env.SERVER_URL;
      const relativePath = req.file.path.replace(/\\/g, "/");
      banner.image = `${serverUrl}/${relativePath}`;
    }

    await banner.save();

    res.status(200).json({
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    // If update fails but a file was uploaded, delete the new orphan file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // 1. DELETE IMAGE FROM FOLDER
    if (banner.image) {
      deleteFile(banner.image);
    }

    // 2. DELETE FROM DB
    await Banner.findByIdAndDelete(id);

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};