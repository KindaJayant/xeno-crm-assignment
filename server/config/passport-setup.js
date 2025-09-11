const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// In-memory "database" to store users
const users = {};

// Saves user information into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieves user information from the session
passport.deserializeUser((id, done) => {
  done(null, users[id]);
});

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    // When a user logs in, save their profile to our in-memory store
    users[profile.id] = profile;
    console.log('User authenticated:', profile.displayName);
    done(null, profile);
  })
);