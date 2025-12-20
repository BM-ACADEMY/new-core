const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // Controls if images load at all
  isPublic: {
    type: Boolean,
    default: false, 
  },
  // NEW: Controls if the Title Button appears in the filter list
  showInTabs: {
    type: Boolean,
    default: true, 
  },
  imagePaths: [
    {
      type: String,
      required: true,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Image", imageSchema);