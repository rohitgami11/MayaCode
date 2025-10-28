const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

const connectDB = require("./config/db.js");
const { errorHandler } = require("./middleware/errorMiddleware.js");
require("./config/passport.js"); // Load passport config

const postRoutes = require("./routes/postRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const imageRoutes = require("./routes/imageRoutes.js");

require("dotenv").config()

// Set environment variables if not already set
process.env.JWT_SECRET_VERIFY = process.env.JWT_SECRET_VERIFY;

// SMTP credentials should be set via environment variables
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ SMTP credentials not set. Email functionality will not work.');
  console.warn('Please set SMTP_USER and SMTP_PASS environment variables.');
}

connectDB();

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase JSON body limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: false })); // Increase URL encoded limit

// Serve static files from public directory with optimized headers
app.use('/public', express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      // Set aggressive caching for images
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', require('crypto').createHash('md5').update(filePath).digest('hex'));
    }
  },
  maxAge: '1y' // Browser cache for 1 year
}));

app.use((req, res, next) => {
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "MayaCode Backend is running!", 
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth",
      posts: "/api/posts", 
      users: "/api/users",
      messages: "/api/messages",
      images: "/api/images"
    }
  });
});

// Test endpoint to verify backend is receiving requests
app.post("/api/test", (req, res) => {
  console.log("🧪 TEST ENDPOINT HIT!");
  console.log("Request body:", req.body);
  res.json({ message: "Test endpoint working!", received: req.body });
});

// API routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/images", imageRoutes);

// Global error handler for unhandled exceptions
app.use((err, req, res, next) => {
  console.error('🚨 GLOBAL ERROR HANDLER:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body size:', req.body ? JSON.stringify(req.body).length : 'no body');
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' 
  });
});

// Error middleware
app.use(errorHandler);

module.exports = app;
