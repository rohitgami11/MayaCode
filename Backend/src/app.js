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
// console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
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
