require("dotenv").config()
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BACKEND_URI) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URI}/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
  console.log('✅ Google OAuth strategy configured');
} else {
  console.warn('⚠️ Google OAuth credentials not configured. Google login will not be available.');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
