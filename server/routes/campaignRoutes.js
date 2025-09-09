const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Operator mapping for MongoDB
const operatorMap = {
  '>': '$gt',
  '<': '$lt',
  '=': '$eq'
};

router.post('/preview', async (req, res) => {
  const { rules, conjunction } = req.body;

  try {
    // --- Build the MongoDB Query ---
    const queryConditions = rules.map(rule => {
      const condition = {};
      const mongoOperator = operatorMap[rule.operator];
      
      // Map frontend fields to DB fields
      const fieldMap = {
        spend: 'totalSpends',
        visits: 'visits',
        last_seen: 'lastVisit' // Assuming last_seen corresponds to lastVisit
      };
      const dbField = fieldMap[rule.field];

      // Handle different data types
      let value = rule.value;
      if (dbField === 'lastVisit') {
        // Example: if rule.value is "30" (days ago)
        const daysAgo = parseInt(value, 10);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        value = date;
      } else {
        value = parseInt(value, 10);
      }
      
      condition[dbField] = { [mongoOperator]: value };
      return condition;
    });

    let query;
    if (conjunction === 'AND') {
      query = { $and: queryConditions };
    } else { // OR
      query = { $or: queryConditions };
    }

    const count = await Customer.countDocuments(query);
    res.status(200).json({ audienceSize: count });
  } catch (error) {
    console.error('Error fetching audience preview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;