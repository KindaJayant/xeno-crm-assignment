// server/index.js
require('dotenv').config();
import aiRoutes from "./routes/aiRoutes.js";
app.use("/api/ai", aiRoutes);
const campaignRoutes = require("./routes/campaignRoutes");
app.use("/api/campaigns", campaignRoutes);


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

// side-effect import to configure strategies
require('./config/passport-setup');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- middleware (order matters) ---------- */
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_session_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------- DB ---------- */
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('Connection error:', err));

/* ---------- routes ---------- */
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/ingest', require('./routes/ingestionRoutes'));
app.use('/api/delivery-receipt', require('./routes/deliveryReceiptRoutes'));
app.use("/api/ai", require("./routes/aiRoutes"));
// <-- contains POST /generate-rules

// simple health check
app.get('/healthz', (_req, res) => res.send('ok'));

/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
