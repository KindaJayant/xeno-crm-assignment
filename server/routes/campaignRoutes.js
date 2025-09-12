// server/routes/campaignRoutes.js
const express = require("express");
const router = express.Router();

const Campaign = require("../models/Campaign");
const CommunicationLog = require("../models/CommunicationLog");

// Import services (findAudience, sendCommunication)
const svc = require("../services/campaignProcessor");

// Guard: ensure required functions exist
if (typeof svc.findAudience !== "function" || typeof svc.sendCommunication !== "function") {
  throw new Error("campaignProcessor must export findAudience and sendCommunication");
}

/**
 * POST /api/campaigns/preview
 * Body: { rules: [{field,operator,value}], conjunction: "AND"|"OR" }
 * Returns: { audienceSize: number }
 */
router.post("/preview", async (req, res) => {
  try {
    const { rules, conjunction } = req.body;
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: "Rules must be a non-empty array." });
    }
    const audience = await svc.findAudience(rules, conjunction);
    return res.status(200).json({ audienceSize: audience.length });
  } catch (error) {
    console.error("Error in preview route:", error);
    return res.status(500).json({ message: "Server error during preview" });
  }
});

/**
 * GET /api/campaigns
 * Returns: Campaign[] (with stats.sent, stats.failed)
 */
router.get("/", async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    const ids = campaigns.map((c) => c._id);

    const agg = await CommunicationLog.aggregate([
      { $match: { campaignId: { $in: ids } } },
      {
        $group: {
          _id: "$campaignId",
          sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
        },
      },
    ]);

    const statById = new Map(
      agg.map((a) => [String(a._id), { sent: a.sent, failed: a.failed }])
    );

    const withStats = campaigns.map((c) => ({
      ...c,
      stats: statById.get(String(c._id)) || { sent: 0, failed: 0 },
    }));

    return res.status(200).json(withStats);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ message: "Server error fetching campaigns" });
  }
});

/**
 * POST /api/campaigns
 * Body: { rules, conjunction }
 * Creates a campaign and asynchronously triggers communication sends.
 */
router.post("/", async (req, res) => {
  try {
    const { rules, conjunction } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: "Rules must be a non-empty array." });
    }

    // 1) Compute audience
    const audience = await svc.findAudience(rules, conjunction);

    // 2) Save campaign
    const campaign = await new Campaign({
      rules,
      conjunction,
      audienceSize: audience.length,
    }).save();

    console.log(
      `Found ${audience.length} customers for campaign ${campaign._id}. Starting communication process...`
    );

    // 3) Kick off sends (do not block response)
    (async () => {
      try {
        await Promise.allSettled(
          audience.map((customer) => svc.sendCommunication(customer, campaign))
        );
      } catch (err) {
        console.error("Unhandled error during sendCommunication batch:", err);
      }
    })();

    return res.status(201).json({
      message: "Campaign created and delivery process started.",
      campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return res
      .status(400)
      .json({ message: "Error creating campaign", error: error.message });
  }
});

module.exports = router;
