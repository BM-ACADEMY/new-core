const express = require("express");
const router = express.Router();
const uploadBanner = require("../Config/bannerUpload");
const { 
  createBanner, 
  getAllBanners, 
  deleteBanner, 
  updateBanner 
} = require("../Controller/bannerController");

router.post("/", uploadBanner.single("bannerImage"), createBanner);
router.get("/", getAllBanners);
router.put("/:id", uploadBanner.single("bannerImage"), updateBanner); // Add Update
router.delete("/:id", deleteBanner); // Add Delete

module.exports = router;