// routes/payments.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Create payments table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      amount REAL NOT NULL,
      taxable INTEGER DEFAULT 0,
      method TEXT,
      date TEXT DEFAULT (date('now')),
      FOREIGN KEY(student_id) REFERENCES students(id)
    )
  `);

  // Add a payment
  router.post('/', (req, res) => {
    const { student_id, amount, taxable, method, date } = req.body;

    const sql = `INSERT INTO payments 
      (student_id, amount, taxable, method, date) 
      VALUES (?, ?, ?, ?, ?)`;

    db.run(
      sql,
      [
        student_id,
        amount,
        taxable ? 1 : 0,
        method,
        date || new Date().toISOString().split('T')[0],
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
      }
    );
  });

  // Get all payments with student names
  router.get('/', (req, res) => {
    const sql = `
      SELECT payments.id,
             students.first_name || ' ' || students.last_name AS student, 
             payments.amount, 
             payments.taxable, 
             payments.method, 
             payments.date
      FROM payments
      LEFT JOIN students ON payments.student_id = students.id
      ORDER BY payments.date DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  return router;
};
