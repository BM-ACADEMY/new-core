const express = require("express");
const router = express.Router();
const upload = require("../Config/multer");
const imageController = require("../Controller/imageController");

// Basic validation check to prevent "handler must be a function" crash
if (!imageController.uploadImages) {
    console.error("ERROR: uploadImages function is missing in imageController!");
}

router.post("/upload", upload.array("images", 10), imageController.uploadImages);
router.get("/all", imageController.getAllGalleries);
router.delete("/delete/:id", imageController.deleteGallery);
router.patch("/delete-image/:id", imageController.deleteSingleImage);
router.patch("/update-visibility/:id", imageController.updateGalleryVisibility);
router.patch("/update-tabs/:id", imageController.updateTabVisibility);

module.exports = router;