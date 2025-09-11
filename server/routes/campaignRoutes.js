const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { findAudience, sendCommunication } = require('../services/campaignProcessor');

// POST /api/campaigns/preview
router.post('/preview', async (req, res) => {
  try {
    const { rules, conjunction } = req.body;
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: 'Rules must be a non-empty array.' });
    }

    const audience = await findAudience(rules, conjunction);
    res.status(200).json({ audienceSize: audience.length });
  } catch (error) {
    console.error('Error in preview route:', error);
    res.status(500).json({ message: 'Server error during preview' });
  }
});

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error fetching campaigns' });
  }
});

// POST /api/campaigns (create + launch)
router.post('/', async (req, res) => {
  try {
    const { rules, conjunction } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ message: 'Rules must be a non-empty array.' });
    }

    // Create campaign
    const audience = await findAudience(rules, conjunction);
    const newCampaign = new Campaign({
      rules,
      conjunction,
      audienceSize: audience.length,
    });
    await newCampaign.save();

    console.log(`Found ${audience.length} customers for campaign ${newCampaign._id}. Starting communication process...`);

    // Start communication process
    for (const customer of audience) {
      sendCommunication(customer, newCampaign);
    }

    res.status(201).json({
      message: 'Campaign created and delivery process started.',
      campaign: newCampaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(400).json({ message: 'Error creating campaign', error: error.message });
  }
});

module.exports = router;
