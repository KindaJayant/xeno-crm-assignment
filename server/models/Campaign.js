const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  field: String,
  operator: String,
  value: String
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'My Campaign'
  },
  rules: [ruleSchema],
  conjunction: {
    type: String, // 'AND' or 'OR'
    required: true
  },
  audienceSize: {
    type: Number,
    required: true
  },
  sent: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;