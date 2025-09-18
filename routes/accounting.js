const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // helper: check if a table has a given column
  const tableHasColumn = (table, column) =>
    new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.some(r => r.name === column));
      });
    });

  const getOne = (sql, params) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) =>
        err ? reject(err) : resolve(row ? row.value ?? row.total ?? row.sum ?? 0 : 0)
      );
    });

  const getAll = (sql, params) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
    });

  // Summary endpoint
  router.get('/summary', async (req, res) => {
    const from = req.query.from || '1970-01-01';
    const to   = req.query.to   || '9999-12-31';

    try {
      const paymentsHasTaxable = await tableHasColumn('payments','taxable');
      const paymentsHasMethod  = await tableHasColumn('payments','method');
      const expensesHasTaxable = await tableHasColumn('expenses','taxable');
      const expensesHasMethod  = await tableHasColumn('expenses','method');

      const totalIncome   = await getOne(
        `SELECT COALESCE(SUM(amount),0) AS value FROM payments WHERE date BETWEEN ? AND ?`,
        [from, to]
      );
      const totalExpenses = await getOne(
        `SELECT COALESCE(SUM(amount),0) AS value FROM expenses WHERE date BETWEEN ? AND ?`,
        [from, to]
      );

      let taxableIncome=null, nonTaxableIncome=null, cashIncome=null, nonCashIncome=null;
      if (paymentsHasTaxable) {
        taxableIncome = await getOne(
          `SELECT COALESCE(SUM(amount),0) AS value FROM payments WHERE date BETWEEN ? AND ? AND taxable=1`,
          [from, to]
        );
        nonTaxableIncome = totalIncome - taxableIncome;
      }
      if (paymentsHasMethod) {
        cashIncome = await getOne(
          `SELECT COALESCE(SUM(amount),0) AS value FROM payments WHERE date BETWEEN ? AND ? AND LOWER(method)='cash'`,
          [from, to]
        );
        nonCashIncome = totalIncome - cashIncome;
      }

      let taxableExpenses=null, nonTaxableExpenses=null, cashExpenses=null, nonCashExpenses=null;
      if (expensesHasTaxable) {
        taxableExpenses = await getOne(
          `SELECT COALESCE(SUM(amount),0) AS value FROM expenses WHERE date BETWEEN ? AND ? AND taxable=1`,
          [from, to]
        );
        nonTaxableExpenses = totalExpenses - taxableExpenses;
      }
      if (expensesHasMethod) {
        cashExpenses = await getOne(
          `SELECT COALESCE(SUM(amount),0) AS value FROM expenses WHERE date BETWEEN ? AND ? AND LOWER(method)='cash'`,
          [from, to]
        );
        nonCashExpenses = totalExpenses - cashExpenses;
      }

      const incomeByMonth = await getAll(
        `SELECT strftime('%Y-%m', date) AS month, COALESCE(SUM(amount),0) AS total
         FROM payments WHERE date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
        [from,to]
      );
      const expensesByMonth = await getAll(
        `SELECT strftime('%Y-%m', date) AS month, COALESCE(SUM(amount),0) AS total
         FROM expenses WHERE date BETWEEN ? AND ? GROUP BY month ORDER BY month`,
        [from,to]
      );

      res.json({
        range: { from, to },
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          net: totalIncome - totalExpenses
        },
        income_breakdown: {
          taxable:     taxableIncome,
          non_taxable: nonTaxableIncome,
          cash:        cashIncome,
          non_cash:    nonCashIncome
        },
        expense_breakdown: {
          taxable:     taxableExpenses,
          non_taxable: nonTaxableExpenses,
          cash:        cashExpenses,
          non_cash:    nonCashExpenses
        },
        trends: { incomeByMonth, expensesByMonth }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to compute accounting summary', detail: e.message });
    }
  });

  // Payments by student
  router.get('/payments-by-student', (req, res) => {
    const sql = `
      SELECT s.first_name || ' ' || s.last_name AS student,
             COALESCE(SUM(p.amount), 0) AS total_paid
      FROM payments p
      JOIN students s ON p.student_id = s.id
      GROUP BY s.id
      ORDER BY student;
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch payments by student', detail: err.message });
      } else {
        res.json(rows);
      }
    });
  });

  return router;
};
