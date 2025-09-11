// server/routes/campaignRoutes.js
const express = require('express');
const router = express.Router();

const Campaign = require('../models/Campaign');

// Import exactly from the server/services path
const svcPath = require.resolve('../services/campaignProcessor');
const svc = require('../services/campaignProcessor');

// Optional debug (uncomment for one run to confirm):
// console.log('[resolved campaignProcessor]', svcPath, 'exports:', Object.keys(svc));

// Guard: fail fast if we didn’t get the right exports
if (typeof svc.findAudience !== 'function' || typeof svc.sendCommunication !== 'function') {
  throw new Error('campaignProcessor must export findAudience and sendCommunication');
}

/**
 * POST /api/campaigns/preview
 */
router.post('/preview', async (req, res) => {
  try {
    const { rules, conjunction } = req.body;
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: 'Rules must be a non-empty array.' });
    }
    const audience = await svc.findAudience(rules, conjunction);
    return res.status(200).json({ audienceSize: audience.length });
  } catch (error) {
    console.error('Error in preview route:', error);
    return res.status(500).json({ message: 'Server error during preview' });
  }
});

/**
 * GET /api/campaigns
 */
router.get('/', async (_req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ message: 'Server error fetching campaigns' });
  }
});

/**
 * POST /api/campaigns
 * Create a campaign and kick off the delivery process.
 */
router.post('/', async (req, res) => {
  try {
    const { rules, conjunction } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: 'Rules must be a non-empty array.' });
    }

    // 1) Compute audience
    const audience = await svc.findAudience(rules, conjunction);

    // 2) Save campaign with computed audience size
    const campaign = await new Campaign({
      rules,
      conjunction,
      audienceSize: audience.length,
    }).save();

    console.log(
      `Found ${audience.length} customers for campaign ${campaign._id}. Starting communication process...`
    );

    // 3) Kick off sends concurrently; we don’t block the API response
    (async () => {
      try {
        await Promise.allSettled(
          audience.map((customer) => svc.sendCommunication(customer, campaign))
        );
      } catch (err) {
        console.error('Unhandled error during sendCommunication batch:', err);
      }
    })();

    return res.status(201).json({
      message: 'Campaign created and delivery process started.',
      campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res
      .status(400)
      .json({ message: 'Error creating campaign', error: error.message });
  }
});

module.exports = router;
