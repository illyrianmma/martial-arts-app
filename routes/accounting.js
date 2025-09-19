// routes/accounting.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) => {
    const data = { totalIncome: 0, totalExpenses: 0, netBalance: 0, income: [], expenses: [] };

    const incomeSql = `
      SELECT p.*, s.first_name || ' ' || s.last_name AS student_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
    `;
    const expenseSql = `SELECT * FROM expenses`;

    db.all(incomeSql, [], (err, incomeRows) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(expenseSql, [], (err2, expenseRows) => {
        if (err2) return res.status(500).json({ error: err2.message });

        data.income = incomeRows;
        data.expenses = expenseRows;

        data.totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
        data.totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
        data.netBalance = data.totalIncome - data.totalExpenses;

        res.json(data);
      });
    });
  });

  return router;
};
