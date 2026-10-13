import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All transaction routes are protected
router.use(requireAuth);

// ─────────────────────────────────────────────
// GET /api/transactions
// Optional query params: month (YYYY-MM), categoryId, type
// ─────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { month, categoryId, type, page = 1, limit = 50 } = req.query;

    const conditions = ["t.user_id = $1"];
    const params = [req.user.id];
    let paramIdx = 2;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      conditions.push(`TO_CHAR(t.transaction_date, 'YYYY-MM') = $${paramIdx++}`);
      params.push(month);
    }

    if (categoryId && /^\d+$/.test(categoryId)) {
      conditions.push(`t.category_id = $${paramIdx++}`);
      params.push(categoryId);
    }

    if (type && ["INCOME", "EXPENSE"].includes(type.toUpperCase())) {
      conditions.push(`t.type = $${paramIdx++}`);
      params.push(type.toUpperCase());
    }

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const query = `
      SELECT
        t.id,
        t.type,
        t.amount,
        t.description,
        t.transaction_date,
        t.created_at,
        t.category_id,
        c.name AS category_name,
        c.type AS category_type
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    const result = await pool.query(query, params);

    // Count total for pagination
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions t
       WHERE ${conditions.join(" AND ")}`,
      countParams
    );

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/transactions
// ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { categoryId, type, amount, description, transactionDate } = req.body;

    // Validate type
    const normalizedType = typeof type === "string" ? type.trim().toUpperCase() : "";
    if (!["INCOME", "EXPENSE"].includes(normalizedType)) {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Validate categoryId
    if (!categoryId || !/^\d+$/.test(String(categoryId))) {
      return res.status(400).json({ message: "A valid category is required" });
    }

    // Validate transactionDate
    const dateStr = transactionDate || new Date().toISOString().split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Verify category belongs to this user
    const catCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
      [categoryId, req.user.id]
    );
    if (catCheck.rowCount === 0) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, category_id, type, amount, description, transaction_date`,
      [req.user.id, categoryId, normalizedType, numAmount, description?.trim() || null, dateStr]
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/transactions/:id
// ─────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await pool.query(
      `SELECT t.id, t.type, t.amount, t.description, t.transaction_date, t.created_at,
              t.category_id, c.name AS category_name
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ transaction: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/transactions/:id
// ─────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    // Confirm ownership
    const existing = await pool.query(
      "SELECT id FROM transactions WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { categoryId, type, amount, description, transactionDate } = req.body;

    const normalizedType = typeof type === "string" ? type.trim().toUpperCase() : "";
    if (!["INCOME", "EXPENSE"].includes(normalizedType)) {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!categoryId || !/^\d+$/.test(String(categoryId))) {
      return res.status(400).json({ message: "A valid category is required" });
    }

    const dateStr = transactionDate || new Date().toISOString().split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Verify category belongs to this user
    const catCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
      [categoryId, req.user.id]
    );
    if (catCheck.rowCount === 0) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, category_id, type, amount, description, transaction_date`,
      [categoryId, normalizedType, numAmount, description?.trim() || null, dateStr, id, req.user.id]
    );

    res.json({
      message: "Transaction updated successfully",
      transaction: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/transactions/:id
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
