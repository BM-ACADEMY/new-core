const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();





const connectDB = require("./Config/db");
const userRoutes = require("./Routes/userroutes");
const authRoutes = require("./Routes/authroutes");
const review = require("./Routes/Reviewroute")
const imageRoutes = require("./Routes/imageRoutes");
const bannerRoutes = require("./Routes/bannerRoutes");
const emailRoutes = require("./Routes/emailRoutes");
const blogRoutes = require("./Routes/blogRoutes");
const resumeRoutes = require("./Routes/resumeRoutes");
const planRoutes = require("./Routes/planRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");

const app = express();

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// ================== MIDDLEWARE ==================

// Security
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// Unified CORS setup
const allowedOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // needed to send cookies
  })
);


// Root route
app.get("/", (req, res) => {
  res.send("🚀 Core talents Backend is live!");
});

// ================== ROUTES ==================
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/review",review)
app.use("/api/gallery", imageRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/plans", planRoutes);       // New
app.use("/api/payment", paymentRoutes);  // New

// ================== START SERVER ==================
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
