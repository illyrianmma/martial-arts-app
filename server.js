const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Routes
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');
const expenseRoutes = require('./routes/expenses');
const accountingRoutes = require('./routes/accounting');

app.use('/api/students', studentRoutes(db));
app.use('/api/attendance', attendanceRoutes(db));
app.use('/api/payments', paymentRoutes(db));
app.use('/api/expenses', expenseRoutes(db));
app.use('/api/accounting', accountingRoutes(db));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('>>> server.js started <<<');
  console.log('>>> Routes registered: /api/students, /api/attendance, /api/payments, /api/expenses, /api/accounting');
  console.log(`Server running on http://localhost:${PORT}`);
});
