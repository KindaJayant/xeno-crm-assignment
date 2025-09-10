const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog'); // Import the model

// POST /api/delivery-receipt
router.post('/', async (req, res) => {
  const { logId, status } = req.body;

  try {
    // Find the log by its ID and update the status
    const updatedLog = await CommunicationLog.findByIdAndUpdate(
      logId,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!updatedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }

    console.log(`Updated log ${logId} to status ${status}`);
    res.status(200).json({ message: 'Receipt acknowledged', log: updatedLog });
  } catch (error) {
    console.error('Error updating communication log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;