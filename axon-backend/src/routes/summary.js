// src/routes/summary.js
// Mounted at /api/tasks/summary in index.js — MUST be before /:id route
const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const result = await db.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'done')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress,
        COUNT(*) FILTER (WHERE status = 'todo')::int AS todo,
        COUNT(*) FILTER (WHERE status = 'review')::int AS review,
        COUNT(*) FILTER (WHERE due_date < $2 AND status != 'done')::int AS overdue,
        COUNT(*) FILTER (WHERE priority = 'high')::int AS high_priority,
        COUNT(*) FILTER (WHERE priority = 'medium')::int AS medium_priority,
        COUNT(*) FILTER (WHERE priority = 'low')::int AS low_priority
       FROM tasks WHERE user_id = $1`,
      [userId, today]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

module.exports = router;
