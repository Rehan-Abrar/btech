// src/routes/tasks.js
const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { validate } = require("../middleware/validate");

const router = express.Router();

const taskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional().default(""),
  due_date: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["todo", "in-progress", "review", "done"]).default("todo"),
});

const updateTaskSchema = taskSchema.partial();

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const { priority, status, cursor, limit = 50 } = req.query;
    const userId = req.user.id;

    let conditions = ["user_id = $1"];
    let params = [userId];
    let i = 2;

    if (priority && priority !== "all") {
      conditions.push(`priority = $${i++}`);
      params.push(priority.toLowerCase());
    }
    if (status && status !== "all") {
      conditions.push(`status = $${i++}`);
      params.push(status.toLowerCase().replace(" ", "-"));
    }
    if (cursor) {
      conditions.push(`created_at < $${i++}`);
      params.push(cursor);
    }

    const whereClause = conditions.join(" AND ");
    const pageLimit = Math.min(parseInt(limit), 100);

    const result = await db.query(
      `SELECT * FROM tasks WHERE ${whereClause}
       ORDER BY created_at DESC LIMIT $${i}`,
      [...params, pageLimit + 1]
    );

    const rows = result.rows;
    const hasMore = rows.length > pageLimit;
    const tasks = hasMore ? rows.slice(0, -1) : rows;
    const nextCursor = hasMore ? tasks[tasks.length - 1].created_at : null;

    res.json({ tasks, nextCursor, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// POST /api/tasks
router.post("/", validate(taskSchema), async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description, due_date || null, priority, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", validate(updateTaskSchema), async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const userId = req.user.id;

    const fields = [];
    const values = [];
    let i = 1;

    if (title !== undefined)       { fields.push(`title = $${i++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${i++}`); values.push(description); }
    if (due_date !== undefined)    { fields.push(`due_date = $${i++}`);    values.push(due_date || null); }
    if (priority !== undefined)    { fields.push(`priority = $${i++}`);    values.push(priority); }
    if (status !== undefined)      { fields.push(`status = $${i++}`);      values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(req.params.id, userId);
    const result = await db.query(
      `UPDATE tasks SET ${fields.join(", ")}
       WHERE id = $${i++} AND user_id = $${i}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
