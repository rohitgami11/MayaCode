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

require("dotenv").config()

// Set environment variables if not already set
process.env.SMTP_USER = process.env.SMTP_USER || 'rohitgami2003@gmail.com';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'lfxcczjulqajfxxh';
process.env.JWT_SECRET_VERIFY = process.env.JWT_SECRET_VERIFY || '8d4e0de1dc4adfkbmf919d3328394d15c96ca';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// API routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Error middleware
app.use(errorHandler);

module.exports = app;
