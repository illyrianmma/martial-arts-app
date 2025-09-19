// routes/expenses.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Create expenses table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      taxable INTEGER DEFAULT 0,
      method TEXT,
      date TEXT DEFAULT (date('now'))
    )
  `);

  // Add expense
  router.post('/', (req, res) => {
    const { description, amount, taxable, method, date } = req.body;

    const sql = `INSERT INTO expenses (description, amount, taxable, method, date)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(
      sql,
      [description, amount, taxable, method, date || new Date().toISOString().split('T')[0]],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
      }
    );
  });

  // Get all expenses
  router.get('/', (req, res) => {
    const sql = `SELECT * FROM expenses ORDER BY date DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  return router;
};
