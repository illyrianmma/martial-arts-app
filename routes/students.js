// routes/students.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all students
  router.get('/', (req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Add a new student
  router.post('/', (req, res) => {
    const { first_name, last_name, email, phone, program } = req.body;
    db.run(
      `INSERT INTO students (first_name, last_name, email, phone, program) VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, program],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });

  return router;
};
