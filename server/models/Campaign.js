const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    rules: { type: Array, required: true },
    conjunction: { type: String, required: true },
    audienceSize: { type: Number, required: true },
    name: String,
    channel: String,
    message: String,
  },
  { timestamps: true } // ← adds createdAt/updatedAt
);

module.exports = mongoose.model('Campaign', campaignSchema);
