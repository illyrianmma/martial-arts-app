// routes/leads.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Create leads table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      callback_date TEXT
    )
  `);

  // Add lead
  router.post('/', (req, res) => {
    const { name, phone, email, callback_date } = req.body;
    const sql = `
      INSERT INTO leads (name, phone, email, callback_date)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [name, phone, email, callback_date], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  });

  // Get all leads
  router.get('/', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY callback_date ASC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  return router;
};
