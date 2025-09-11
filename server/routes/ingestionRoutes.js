const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// POST /api/ingest/customers
router.post('/customers', async (req, res) => {
  // Logic to add a customer will go here
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
  } catch (error) {
    res.status(400).json({ message: 'Error creating customer', error });
  }
});

// POST /api/ingest/orders
router.post('/orders', async (req, res) => {
  // Logic to add an order will go here
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error });
  }
});

module.exports = router;