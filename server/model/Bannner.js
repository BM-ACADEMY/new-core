const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    subheading: {
      type: String,
      required: [true, "Please add a subheading"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please upload a banner image"],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model("Banner", bannerSchema);