// routes/students.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Ensure students table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      program TEXT,
      start_date TEXT DEFAULT (date('now')),
      renewal_date TEXT DEFAULT (date('now', '+28 days'))
    )
  `);

  // Add student
  router.post('/', (req, res) => {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      program,
      start_date,
      renewal_date
    } = req.body;

    let startDate = start_date || new Date().toISOString().split('T')[0];
    let renewalDate = renewal_date;
    if (!renewalDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 28);
      renewalDate = d.toISOString().split('T')[0];
    }

    const sql = `
      INSERT INTO students
      (first_name, last_name, email, phone, address, program, start_date, renewal_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [first_name, last_name, email, phone, address, program, startDate, renewalDate],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });

  // Get all students
  router.get('/', (req, res) => {
    const sql = `
      SELECT id, first_name, last_name, email, phone, address, program, start_date, renewal_date
      FROM students
      ORDER BY id DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Update student
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      program,
      start_date,
      renewal_date
    } = req.body;

    const sql = `
      UPDATE students
      SET first_name=?, last_name=?, email=?, phone=?, address=?, program=?, start_date=?, renewal_date=?
      WHERE id=?
    `;

    db.run(
      sql,
      [first_name, last_name, email, phone, address, program, start_date, renewal_date, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
      }
    );
  });

  // Delete student
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM students WHERE id=?`, [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });

  return router;
};
