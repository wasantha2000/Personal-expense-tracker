
const express = require("express");
const pool = require("../db");

const router = express.Router();

// Test category routes
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Category routes are working",
  });
});

// GET categories for a user
router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || !/^\d+$/.test(user_id) || BigInt(user_id) <= 0n) {
      return res.status(400).json({
        success: false,
        message: "A valid user_id is required",
      });
    }

    const result = await pool.query(
      `SELECT id, user_id, name, type
       FROM categories
       WHERE user_id = $1
       ORDER BY name ASC`,
      [user_id]
    );

    res.json({
      success: true,
      count: result.rowCount,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
});

// POST a new category
router.post("/", async (req, res) => {
  try {
    const { user_id, name, type } = req.body;

    if (!user_id || !/^\d+$/.test(String(user_id)) || BigInt(user_id) <= 0n) {
      return res.status(400).json({
        success: false,
        message: "A valid user_id is required",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalizedType =
      typeof type === "string" ? type.trim().toUpperCase() : "";

    if (!["INCOME", "EXPENSE"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be INCOME or EXPENSE",
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, type`,
      [user_id, name.trim(), normalizedType]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "The specified user does not exist",
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
});

module.exports = router;
