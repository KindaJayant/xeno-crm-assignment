// server/services/campaignProcessor.js
const axios = require('axios');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');

// Map UI operators to Mongo operators
const operatorMap = { '>': '$gt', '<': '$lt', '=': '$eq' };

/**
 * Build a Mongo query from rules and return matching customers.
 * rules: [{ field: 'spend'|'visits', operator: '>'|'<'|'=', value: '123' }, ...]
 * conjunction: 'AND' | 'OR'
 */
async function findAudience(rules, conjunction) {
  const queryConditions = rules.map((rule) => {
    const mongoOperator = operatorMap[rule.operator];
    const fieldMap = { spend: 'totalSpends', visits: 'visits' };
    const dbField = fieldMap[rule.field];

    if (!dbField || !mongoOperator) {
      throw new Error('Invalid rule field or operator');
    }

    const value = parseInt(rule.value, 10);
    if (Number.isNaN(value)) {
      throw new Error('Invalid numeric value for rule');
    }

    return { [dbField]: { [mongoOperator]: value } };
  });

  const query =
    conjunction === 'AND'
      ? { $and: queryConditions }
      : { $or: queryConditions };

  return Customer.find(query);
}

/**
 * Simulated sender: logs, creates CommunicationLog, “reports” delivery.
 */
async function sendCommunication(customer, campaign) {
  // Create initial pending log
  const log = await CommunicationLog.create({
    campaignId: campaign._id,
    customerId: customer._id,
    status: 'PENDING',
  });

  // Fake a delivery outcome
  const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';

  try {
    // In real life, call your SMS/email provider here and update the log.
    // For now we “report” via your delivery receipt endpoint.
    await axios.post('http://localhost:5000/api/delivery-receipt', {
      logId: log._id,
      status,
    });
    // (optional) console.log(`Reported ${status} for log ${log._id}`);
  } catch (err) {
    console.error('Error hitting delivery receipt API:', err.message);
  }
}

// ✅ Single, canonical export (don’t mix with `exports = ...`)
module.exports = { findAudience, sendCommunication };

// Debug once if needed:
// console.log('[campaignProcessor.js module.exports keys]', Object.keys(module.exports));
