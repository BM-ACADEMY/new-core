const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  
  {
    title: { type: String, default: "Untitled Resume" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      profession: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    
    // FIX: Define these as Arrays of Objects, not just [] or [String]
    experience: [
      {
        id: { type: Number }, 
        company: { type: String, default: "" },
        title: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        current: { type: Boolean, default: false },
        description: { type: String, default: "" },
      },
    ],
    education: [
      {
        id: { type: Number },
        school: { type: String, default: "" },
        degree: { type: String, default: "" },
        field: { type: String, default: "" },
        date: { type: String, default: "" },
        gpa: { type: String, default: "" },
      },
    ],
    projects: [
      {
        id: { type: Number },
        name: { type: String, default: "" },
        type: { type: String, default: "" }, // 'type' is a reserved word in Mongoose, but usually okay inside an array object. If it fails, change to 'projectType'
        description: { type: String, default: "" },
      },
    ],
    skills: [
      {
        id: { type: Number },
        name: { type: String, default: "" },
      },
    ],
    themeColor: { type: String, default: "#3b82f6" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);