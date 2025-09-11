// Add this at the top of the file
const axios = require('axios');

// ... existing findAudience function is here ...

// --- NEW ---
// This simulates the external vendor API
async function sendCommunication(customer, campaign) {
  const message = `Hi ${customer.name}, here's 10% off on your next order!`;
  console.log(`Sending message to ${customer.email}: "${message}"`);

  // Simulate 90% success, 10% failure
  const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';

  // Simulate the vendor calling our delivery receipt API
  try {
    await axios.post('http://localhost:5000/api/delivery-receipt', {
      campaignId: campaign._id,
      customerId: customer._id,
      status: status,
    });
    console.log(`Reported status '${status}' for ${customer.email}`);
  } catch (error) {
    console.error('Error hitting delivery receipt API:', error.message);
  }
}

// Update the module.exports to include the new function
module.exports = { findAudience, sendCommunication };

const Customer = require('../models/Customer');

// Operator mapping for MongoDB
const operatorMap = {
  '>': '$gt',
  '<': '$lt',
  '=': '$eq'
};

async function findAudience(rules, conjunction) {
  const queryConditions = rules.map(rule => {
    const condition = {};
    const mongoOperator = operatorMap[rule.operator];
    const fieldMap = {
      spend: 'totalSpends',
      visits: 'visits',
    };
    const dbField = fieldMap[rule.field];

    if (!dbField || !mongoOperator) {
      throw new Error(`Invalid rule field or operator`);
    }

    const value = parseInt(rule.value, 10);
    if (isNaN(value)) {
      throw new Error(`Invalid numeric value for rule`);
    }

    condition[dbField] = { [mongoOperator]: value };
    return condition;
  });

  const query = conjunction === 'AND' ? { $and: queryConditions } : { $or: queryConditions };
  
  // Find all customers who match the query
  const audience = await Customer.find(query);
  return audience;
}

module.exports = { findAudience };