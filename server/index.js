// server/index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

// side-effect import to configure strategies
require("./config/passport-setup");

// --- sanity log (keep short; don't print full secrets) ---
if (!process.env.GROQ_API_KEY) {
  console.warn("[env] GROQ_API_KEY missing");
} else {
  console.log("[env] GROQ_API_KEY loaded:", process.env.GROQ_API_KEY.slice(0, 8) + "…");
}

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- middleware (order matters) ---------- */
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_session_key",
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
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

/* ---------- routes ---------- */
const authRoutes = require("./routes/authRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const ingestionRoutes = require("./routes/ingestionRoutes");
const deliveryReceiptRoutes = require("./routes/deliveryReceiptRoutes");
const aiRoutes = require("./routes/aiRoutes"); // uses lazy Groq init

app.use("/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/ingest", ingestionRoutes);
app.use("/api/delivery-receipt", deliveryReceiptRoutes);
app.use("/api/ai", aiRoutes); // <-- contains POST /generate-rules

// simple health check
app.get("/healthz", (_req, res) => res.send("ok"));

/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
