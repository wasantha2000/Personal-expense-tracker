import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All category routes are protected
router.use(requireAuth);

// ─────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { type } = req.query; // optional filter: INCOME | EXPENSE

    let query = `
      SELECT id, name, type
      FROM categories
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (type && ["INCOME", "EXPENSE"].includes(type.toUpperCase())) {
      query += ` AND type = $2`;
      params.push(type.toUpperCase());
    }

    query += ` ORDER BY type ASC, name ASC`;

    const result = await pool.query(query, params);

    res.json({ categories: result.rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/categories
// ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const normalizedType = typeof type === "string" ? type.trim().toUpperCase() : "";
    if (!["INCOME", "EXPENSE"].includes(normalizedType)) {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, name, type`,
      [req.user.id, name.trim(), normalizedType]
    );

    res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
