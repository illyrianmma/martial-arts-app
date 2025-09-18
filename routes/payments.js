// routes/payments.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all payments
  router.get('/', (req, res) => {
    db.all('SELECT * FROM payments', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Add a new payment
  router.post('/', (req, res) => {
    const { student_id, amount, taxable, method, date } = req.body;
    db.run(
      `INSERT INTO payments (student_id, amount, taxable, method, date) VALUES (?, ?, ?, ?, ?)`,
      [student_id, amount, taxable, method, date],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });

  return router;
};
