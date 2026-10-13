import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// ─────────────────────────────────────────────
// GET /api/reports/summary
// Optional query param: month (YYYY-MM)
// Returns: totalIncome, totalExpenses, balance, breakdown by category
// ─────────────────────────────────────────────
router.get("/summary", async (req, res, next) => {
  try {
    const { month } = req.query;

    let dateFilter = "";
    const params = [req.user.id];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      dateFilter = `AND TO_CHAR(transaction_date, 'YYYY-MM') = $2`;
      params.push(month);
    }

    // Income / Expense totals
    const totalsResult = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'INCOME'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1 ${dateFilter}`,
      params
    );

    const { total_income, total_expenses } = totalsResult.rows[0];
    const balance = parseFloat(total_income) - parseFloat(total_expenses);

    // Expense breakdown by category (for chart)
    const breakdownResult = await pool.query(
      `SELECT
         c.name AS category,
         SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1 AND t.type = 'EXPENSE' ${dateFilter}
       GROUP BY c.name
       ORDER BY total DESC`,
      params
    );

    res.json({
      totalIncome: parseFloat(total_income),
      totalExpenses: parseFloat(total_expenses),
      balance,
      expenseBreakdown: breakdownResult.rows.map((r) => ({
        category: r.category,
        total: parseFloat(r.total),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
