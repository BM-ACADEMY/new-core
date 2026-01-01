const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    // --- NEW FIELDS START ---
    isPremium: { type: Boolean, default: false },
    maxResumes: { type: Number, default: 2 }, // Enforces the 2 resume limit
    subscription: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: false }
    }
    // --- NEW FIELDS END ---
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
