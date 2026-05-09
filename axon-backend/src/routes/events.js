// src/routes/events.js
const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { validate } = require("../middleware/validate");

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(1).max(500),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  linked_task_id: z.string().uuid().optional().nullable(),
});

// GET /api/events/calendar
router.get("/calendar", async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;

    let conditions = ["e.user_id = $1"];
    let params = [userId];
    let i = 2;

    if (start) { conditions.push(`e.start_datetime >= $${i++}`); params.push(start); }
    if (end)   { conditions.push(`e.end_datetime <= $${i++}`);   params.push(end); }

    const whereClause = conditions.join(" AND ");

    const result = await db.query(
      `SELECT
        e.id,
        e.title,
        e.start_datetime,
        e.end_datetime,
        e.linked_task_id,
        t.priority AS task_priority,
        t.status AS task_status
       FROM events e
       LEFT JOIN tasks t ON e.linked_task_id = t.id
       WHERE ${whereClause}
       ORDER BY e.start_datetime ASC`,
      params
    );

    // Also include tasks with due_date as virtual events for calendar display
    const taskResult = await db.query(
      `SELECT
        id,
        title,
        due_date::timestamptz AS start_datetime,
        (due_date + INTERVAL '1 hour')::timestamptz AS end_datetime,
        id AS linked_task_id,
        priority AS task_priority,
        status AS task_status
       FROM tasks
       WHERE user_id = $1
       AND due_date IS NOT NULL
       AND status != 'done'
       AND id NOT IN (
         SELECT linked_task_id FROM events
         WHERE linked_task_id IS NOT NULL
         AND user_id = $1
       )`,
      [userId]
    );

    res.json({
      events: result.rows,
      taskEvents: taskResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch calendar" });
  }
});

// POST /api/events
router.post("/", validate(eventSchema), async (req, res) => {
  try {
    const { title, start_datetime, end_datetime, linked_task_id } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO events (user_id, title, start_datetime, end_datetime, linked_task_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, start_datetime, end_datetime, linked_task_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// DELETE /api/events/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
