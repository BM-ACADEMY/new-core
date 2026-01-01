const Resume = require("../model/ResumeModel");
const Subscription = require("../model/SubscriptionModel"); // Ensure you import this

// Helper: Check if user is allowed to create more resumes
const checkResumeLimit = async (userId) => {
  // 1. Count how many resumes this user ALREADY has
  const resumeCount = await Resume.countDocuments({ user: userId });

  // 2. Check for an ACTIVE subscription (Paid Plan)
  const activeSub = await Subscription.findOne({
    user: userId,
    status: 'active',
    endDate: { $gte: new Date() } // Must not be expired
  }).populate('plan');

  // 3. SET THE LIMITS
  let limit = 2; // <--- DEFAULT FREE LIMIT IS 2

  if (activeSub && activeSub.plan) {
    limit = activeSub.plan.resumeLimit; // Use the limit from the paid plan (e.g., 10 or 20)
  }

  // 4. Return result
  return {
    allowed: resumeCount < limit,
    currentCount: resumeCount,
    maxLimit: limit
  };
};

// --- MAIN FUNCTION ---
exports.createResume = async (req, res) => {
  try {
    // A. CHECK LIMIT BEFORE CREATING
    const check = await checkResumeLimit(req.user.id);

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        isLimitReached: true, // <--- Flag for Frontend
        message: `Free limit reached (${check.maxLimit} resumes). Please upgrade to create more.`
      });
    }

    // B. If allowed, proceed to create
    const { title } = req.body;
    const newResume = await Resume.create({
      user: req.user.id,
      title: title || "Untitled Resume",
      personalInfo: {},
      experience: [],
      education: [],
      projects: [],
      skills: []
    });

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: newResume
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Resumes for Dashboard
exports.getAllResumes = async (req, res) => {
  try {
    // Select specific fields to make the dashboard load faster
    const resumes = await Resume.find({ user: req.user.id })
      .select("title updatedAt personalInfo.fullName personalInfo.profession themeColor")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Specific Resume by ID (For the Builder Page)
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Save/Update Resume
exports.saveResume = async (req, res) => {
  try {
    const { resumeId, ...resumeData } = req.body;

    // Handle Image Upload if exists
    if (req.file) {
      // NOTE: Here you would upload to Cloudinary/S3.
      // For now, assuming you return a URL or path
      const imageUrl = `/uploads/${req.file.filename}`; // Adjust based on your uploadConfig

      // Parse personalInfo string back to object to update image
      let personalInfo = JSON.parse(resumeData.personalInfo || '{}');
      personalInfo.image = imageUrl;
      resumeData.personalInfo = personalInfo; // Assign back object (Mongoose handles object vs string if schema matches)
    } else {
      // Parse JSON strings back to objects
      if (typeof resumeData.personalInfo === 'string') resumeData.personalInfo = JSON.parse(resumeData.personalInfo);
    }

    // Parse other arrays
    if (typeof resumeData.experience === 'string') resumeData.experience = JSON.parse(resumeData.experience);
    if (typeof resumeData.education === 'string') resumeData.education = JSON.parse(resumeData.education);
    if (typeof resumeData.projects === 'string') resumeData.projects = JSON.parse(resumeData.projects);
    if (typeof resumeData.skills === 'string') resumeData.skills = JSON.parse(resumeData.skills);

    const updatedResume = await Resume.findOneAndUpdate(
      { _id: resumeId, user: req.user.id },
      { $set: resumeData },
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    res.status(200).json(updatedResume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Resume
exports.deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
