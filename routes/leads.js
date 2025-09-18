// routes/leads.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all leads
  router.get('/', (req, res) => {
    db.all('SELECT * FROM leads', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Add a new lead
  router.post('/', (req, res) => {
    const { name, phone, email, notes, callback_date } = req.body;
    db.run(
      `INSERT INTO leads (name, phone, email, notes, callback_date) VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email, notes, callback_date],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });

  // Delete a lead
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM leads WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deletedID: id });
    });
  });

  return router;
};
