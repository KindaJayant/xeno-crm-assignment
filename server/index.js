require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const passportSetup = require('./config/passport-setup');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session Middleware
app.use(session({
  secret: 'your_secret_session_key',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);

const ingestionRoutes = require('./routes/ingestionRoutes');
app.use('/api/ingest', ingestionRoutes);

const deliveryReceiptRoutes = require('./routes/deliveryReceiptRoutes');
app.use('/api/delivery-receipt', deliveryReceiptRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});