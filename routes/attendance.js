// routes/attendance.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Ensure attendance table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      date TEXT,
      status TEXT,
      FOREIGN KEY(student_id) REFERENCES students(id)
    )
  `);

  // Add attendance record
  router.post('/', (req, res) => {
    const { student_id, date, status } = req.body;
    const sql = `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)`;
    db.run(sql, [student_id, date, status], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  });

  // Get all attendance records
  router.get('/', (req, res) => {
    const sql = `
      SELECT a.id, a.date, a.status,
             s.first_name || ' ' || s.last_name AS student_name
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      ORDER BY a.id DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Update attendance
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { student_id, date, status } = req.body;
    const sql = `UPDATE attendance SET student_id=?, date=?, status=? WHERE id=?`;
    db.run(sql, [student_id, date, status, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    });
  });

  // Delete attendance
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM attendance WHERE id=?`, [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });

  return router;
};
