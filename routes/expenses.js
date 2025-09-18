// routes/expenses.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all expenses
  router.get('/', (req, res) => {
    db.all('SELECT * FROM expenses', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Add a new expense
  router.post('/', (req, res) => {
    const { description, amount, taxable, date } = req.body;
    db.run(
      `INSERT INTO expenses (description, amount, taxable, date) VALUES (?, ?, ?, ?)`,
      [description, amount, taxable, date],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });

  return router;
};
