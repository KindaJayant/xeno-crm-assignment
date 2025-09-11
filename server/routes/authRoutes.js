const express = require('express');
const passport = require('passport');
const router = express.Router();

// GET /auth/google
// Auth with Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// GET /auth/google/callback
// Callback route for Google to redirect to
router.get('/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:5173');
  }
);

// GET /auth/status
// Checks if a user is currently logged in
router.get('/status', (req, res) => {
  if (req.user) {
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

// GET /auth/logout
// Logs the user out
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('http://localhost:5173/login');
  });
});

module.exports = router;