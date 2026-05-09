// src/routes/ai.js
const express = require("express");
const axios = require("axios");
const db = require("../db");

const router = express.Router();

// Gemini API helper
const callGemini = async (systemPrompt, userMessage) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const { data } = await axios.post(url, {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
};

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    const userId = req.user.id;

    // Fetch user's tasks for context
    const tasksResult = await db.query(
      `SELECT title, priority, status, due_date FROM tasks
       WHERE user_id = $1 ORDER BY due_date ASC LIMIT 20`,
      [userId]
    );
    const tasks = tasksResult.rows;

    // Save user message to chat history
    await db.query(
      "INSERT INTO chat_history (user_id, role, message) VALUES ($1, 'user', $2)",
      [userId, message]
    );

    // Fetch recent chat history for context
    const historyResult = await db.query(
      `SELECT role, message FROM chat_history
       WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10`,
      [userId]
    );
    const history = historyResult.rows.reverse();

    const systemPrompt = `You are Axon, an AI productivity assistant. The user's current tasks are:
${tasks.map(t => `- ${t.title} (${t.priority} priority, ${t.status}, due: ${t.due_date || "no date"})`).join("\n")}

Recent conversation:
${history.map(h => `${h.role}: ${h.message}`).join("\n")}

Help the user manage their tasks. If they ask to create a task, respond with valid JSON in this format at the END of your message:
TASK_CREATE:{"title":"...","priority":"low|medium|high","status":"todo","due_date":"YYYY-MM-DD"}

Be concise, helpful, and specific to their actual tasks.`;

    const aiReply = await callGemini(systemPrompt, message);

    // Parse task creation command if present
    let createdTask = null;
    const taskMatch = aiReply.match(/TASK_CREATE:(\{[\s\S]*?\})/);
    if (taskMatch) {
      try {
        const taskData = JSON.parse(taskMatch[1]);
        const taskResult = await db.query(
          `INSERT INTO tasks (user_id, title, priority, status, due_date)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [userId, taskData.title, taskData.priority || "medium", taskData.status || "todo", taskData.due_date || null]
        );
        createdTask = taskResult.rows[0];
      } catch (e) {
        console.error("Failed to parse task from AI response:", e);
      }
    }

    // Clean response (remove the TASK_CREATE JSON from display text)
    const cleanReply = aiReply.replace(/TASK_CREATE:\{[\s\S]*?\}/, "").trim();

    // Save AI response to history
    await db.query(
      "INSERT INTO chat_history (user_id, role, message) VALUES ($1, 'assistant', $2)",
      [userId, cleanReply]
    );

    res.json({
      reply: cleanReply,
      createdTask,
      taskCount: tasks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI chat failed", details: err.message });
  }
});

// POST /api/ai/schedule
router.post("/schedule", async (req, res) => {
  try {
    const userId = req.user.id;

    const tasksResult = await db.query(
      `SELECT id, title, priority, status, due_date, description
       FROM tasks WHERE user_id = $1 AND status != 'done'
       ORDER BY
         CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         due_date ASC NULLS LAST
       LIMIT 15`,
      [userId]
    );

    const tasks = tasksResult.rows;

    if (tasks.length === 0) {
      return res.json({ summary: "No pending tasks found. You're all caught up! 🎉", events: [] });
    }

    const systemPrompt = `You are a productivity scheduler. Return ONLY valid JSON, no other text:
{
  "summary": "Brief overview",
  "schedule": [
    {
      "time": "9:00 AM",
      "task": "Task title",
      "duration_hours": 1.5,
      "priority": "high",
      "task_id": "uuid-here"
    }
  ]
}

IMPORTANT: duration_hours must be a NUMBER like 1, 1.5, 2. Never a string like "1 hour".`;

    const userMessage = `Schedule these tasks for today. Start at 9 AM, end by 6 PM, include breaks.
Tasks: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, due_date: t.due_date })))}`;

    const aiReply = await callGemini(systemPrompt, userMessage);

    let scheduleData;
    try {
      const match = aiReply.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in AI response");
      scheduleData = JSON.parse(match[0]);
    } catch (e) {
      scheduleData = { summary: aiReply, schedule: [] };
    }

    // Create events in DB from the schedule
    const createdEvents = [];
    for (const item of scheduleData.schedule || []) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [timeStr, period] = item.time.split(" ");
        let [hours, minutes] = timeStr.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        const start = new Date(`${today}T${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}:00`);
        const durationHours = Number(item.duration_hours) || 1;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        const eventResult = await db.query(
          `INSERT INTO events (user_id, title, start_datetime, end_datetime, linked_task_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [userId, item.task, start.toISOString(), end.toISOString(), item.task_id || null]
        );
        createdEvents.push(eventResult.rows[0]);
      } catch (e) {
        console.error("Failed to create event from schedule:", e);
      }
    }

    res.json({ ...scheduleData, events: createdEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Schedule generation failed", details: err.message });
  }
});

// POST /api/ai/reorganize (bonus)
router.post("/reorganize", async (req, res) => {
  try {
    const { newTaskTitle, newTaskPriority } = req.body;
    const userId = req.user.id;

    const tasks = await db.query(
      "SELECT * FROM tasks WHERE user_id = $1 AND status != 'done'", [userId]
    );

    const systemPrompt = `You are a task priority optimizer. A new HIGH URGENCY task has been added: "${newTaskTitle}" (${newTaskPriority} priority).
Analyze the existing tasks and return JSON with updated priorities:
{"updates": [{"id": "uuid", "priority": "high|medium|low", "reason": "why"}]}
Only return JSON.`;

    const aiReply = await callGemini(systemPrompt, JSON.stringify(tasks.rows));

    const match = aiReply.match(/\{[\s\S]*\}/);
    if (!match) return res.json({ updates: [], message: "No reorganization needed" });

    const { updates } = JSON.parse(match[0]);

    for (const update of updates) {
      await db.query("UPDATE tasks SET priority = $1 WHERE id = $2 AND user_id = $3",
        [update.priority, update.id, userId]);
    }

    res.json({ updates, message: `Reorganized ${updates.length} tasks` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reorganization failed", details: err.message });
  }
});

module.exports = router;
