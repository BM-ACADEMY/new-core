const express = require("express");
const router = express.Router();
const resumeController = require("../Controller/resumeController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../Config/Resumeupload");

// Create new resume (init with title)
router.post("/create", verifyToken, resumeController.createResume);

// Get all resumes for dashboard
router.get("/all", verifyToken, resumeController.getAllResumes);

// Save/Update resume (uses FormData)
router.post("/save", verifyToken, upload.single("resumeImage"), resumeController.saveResume);

// Get specific resume by ID
router.get("/:id", verifyToken, resumeController.getResumeById);

// Delete specific resume
router.delete("/:id", verifyToken, resumeController.deleteResume);

module.exports = router;