// server/routes/ingestionRoutes.js
const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const Order = require("../models/Order");

// helper
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/ingest/customers
// Body: { customers: [{ name, email, totalSpends, visits }] }
router.post("/customers", async (req, res) => {
  try {
    const { customers } = req.body || {};
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: "Body must be { customers: [...] }" });
    }

    const results = { upserted: 0, updated: 0, skipped: 0 };

    for (const c of customers) {
      const email = (c?.email || "").toLowerCase().trim();
      if (!emailRx.test(email)) {
        results.skipped++;
        continue;
      }

      const update = {
        ...(c.name && { name: c.name }),
        ...(typeof c.totalSpends === "number" && { totalSpends: c.totalSpends }),
        ...(typeof c.visits === "number" && { visits: c.visits }),
      };

      const r = await Customer.updateOne(
        { email },
        { $set: update, $setOnInsert: { email } },
        { upsert: true }
      );

      if (r.matchedCount === 0) results.upserted++;
      else results.updated++;
    }

    return res.json(results);
  } catch (error) {
    console.error("customers ingest error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/ingest/orders
// Body: { orders: [{ customerEmail, amount, orderedAt?, customerName? }] }
router.post("/orders", async (req, res) => {
  try {
    const { orders } = req.body || {};
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "Body must be { orders: [...] }" });
    }

    const results = { created: 0, customerUpserts: 0, skipped: 0 };

    for (const o of orders) {
      const email = (o?.customerEmail || "").toLowerCase().trim();
      const amount = Number(o?.amount);
      if (!emailRx.test(email) || isNaN(amount)) {
        results.skipped++;
        continue;
      }

      // ensure customer exists
      let customer = await Customer.findOne({ email });
      if (!customer) {
        customer = await Customer.create({
          email,
          name: o.customerName || email.split("@")[0],
          totalSpends: 0,
          visits: 0,
        });
        results.customerUpserts++;
      }

      // create order
      await Order.create({
        customerId: customer._id,
        amount,
        orderedAt: o.orderedAt ? new Date(o.orderedAt) : new Date(),
      });

      // update aggregates
      await Customer.updateOne(
        { _id: customer._id },
        { $inc: { totalSpends: amount, visits: 1 } }
      );

      results.created++;
    }

    return res.json(results);
  } catch (error) {
    console.error("orders ingest error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
