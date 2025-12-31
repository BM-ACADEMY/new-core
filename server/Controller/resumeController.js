const Resume = require("../model/ResumeModel");

// 1. Create a Blank Resume (Called when user clicks "Create" in Modal)
exports.createResume = async (req, res) => {
  try {
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