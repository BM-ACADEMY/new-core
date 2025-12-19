const Image = require("../model/Image");
const fs = require("fs");
const path = require("path");

// GET ALL
exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Image.find().sort({ createdAt: -1 });
    res.status(200).json(galleries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching galleries" });
  }
};

// UPLOAD (Create or Update)
exports.uploadImages = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images selected" });
    }

    const serverUrl = process.env.SERVER_URL;
    const newPaths = req.files.map(file => `${serverUrl}/uploads/images/${file.filename}`);

    // Find if title exists
    let gallery = await Image.findOne({ title });

    if (gallery) {
      // Add new images to existing title
      gallery.imagePaths.push(...newPaths);
      await gallery.save();
    } else {
      // Create new title entry
      gallery = new Image({ title, imagePaths: newPaths });
      await gallery.save();
    }

    res.status(201).json({ message: "Images saved successfully", data: gallery });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE ENTIRE TITLE & FILES
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Image.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    // Delete files from storage
    gallery.imagePaths.forEach(fullUrl => {
      const filename = fullUrl.split('/').pop();
      const filePath = path.join(__dirname, "../uploads/images", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: "Gallery deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.deleteSingleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const gallery = await Image.findById(id);
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });

    // Remove from array
    gallery.imagePaths = gallery.imagePaths.filter(path => path !== imageUrl);

    // Delete physical file
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(__dirname, "../uploads/images", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await gallery.save();
    res.json({ message: "Image deleted", data: gallery });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};