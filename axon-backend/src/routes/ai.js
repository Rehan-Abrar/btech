// src/routes/ai.js
const express = require("express");
const axios = require("axios");
const db = require("../db");

const router = express.Router();

// Groq API helper — accepts a full OpenAI-style messages array for multi-turn context
const callGroq = async (messages) => {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const { data } = await axios.post(
    url,
    {
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data.choices?.[0]?.message?.content || "No response.";
};

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    // Fetch user's tasks with full context
    const tasksResult = await db.query(
      `SELECT id, title, priority, status, due_date FROM tasks
       WHERE user_id = $1 ORDER BY
         CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         due_date ASC NULLS LAST
       LIMIT 20`,
      [userId]
    );
    const tasks = tasksResult.rows;

    // Compute real overdue / due-today counts for the system prompt
    const overdueTasks   = tasks.filter(t => t.due_date && t.due_date < today && t.status !== "done");
    const dueTodayTasks  = tasks.filter(t => t.due_date && t.due_date.toISOString?.().split("T")[0] === today || (t.due_date && String(t.due_date).startsWith(today)));
    const pendingTasks   = tasks.filter(t => t.status !== "done");
    const completedCount = tasks.filter(t => t.status === "done").length;

    // Build rich system prompt with real computed data
    const systemPrompt = `You are Axon — a sharp, concise AI productivity assistant embedded inside a task management platform. You have LIVE access to the user's task list below. Use it to give specific, data-driven answers.

TODAY: ${today}

USER'S TASKS (${tasks.length} total, ${completedCount} done, ${pendingTasks.length} pending):
${tasks.length === 0
  ? "  No tasks yet."
  : tasks.map(t => {
      const due = t.due_date ? String(t.due_date).split("T")[0] : null;
      const isOverdue = due && due < today && t.status !== "done";
      return `  - [${t.id}] "${t.title}" | ${t.priority} priority | ${t.status} | due: ${due || "no date"}${isOverdue ? " ⚠️ OVERDUE" : ""}`;
    }).join("\n")}

OVERDUE: ${overdueTasks.length} task(s): ${overdueTasks.map(t => `"${t.title}"`).join(", ") || "none"}
DUE TODAY: ${dueTodayTasks.length} task(s)

CAPABILITIES:
- Answer questions about their tasks with exact data (overdue, counts, priorities, statuses)
- Create tasks for the user if they ask (e.g. "Create a task called X").
- Suggest what to work on next based on priority and deadlines
- Be concise — 2-4 sentences max unless they ask for more detail

TASK CREATION (CRITICAL RULES):
If the user asks you to create or add a task, you MUST do BOTH of these:
1. Say a polite conversational confirmation (e.g., "I've created the task for you.")
2. Append EXACTLY this JSON format at the very END of your message (do not wrap in markdown):
TASK_CREATE:{"title":"...","priority":"low|medium|high|urgent","status":"todo","due_date":"YYYY-MM-DD","recurring_rule":"daily|weekly|monthly|none"}

Rules:
- NEVER mention the TASK_CREATE JSON format, "JSON", or how you create tasks to the user. Do it silently behind the scenes.
- NEVER say you can't see their tasks — you have the full list above
- NEVER make up tasks that don't exist
- If they ask "what's overdue" and there are none, say exactly that with confidence
- Reference tasks by their actual titles from the list above`;

    // Save user message BEFORE fetching history (so it's included in order)
    await db.query(
      "INSERT INTO chat_history (user_id, role, message) VALUES ($1, 'user', $2)",
      [userId, message]
    );

    // Fetch last 20 messages (10 turns) as proper multi-turn history
    const historyResult = await db.query(
      `SELECT role, message FROM chat_history
       WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 20`,
      [userId]
    );
    // Reverse so oldest is first, exclude the message we just saved (it'll be last)
    const historyMessages = historyResult.rows.reverse().map(h => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.message,
    }));

    // Build full messages array: system → history (includes current user msg)
    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
    ];

    const aiReply = await callGroq(messages);

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

    // Clean response (strip TASK_CREATE JSON from display text)
    let cleanReply = aiReply.replace(/TASK_CREATE:\{[\s\S]*?\}/, "").trim();

    // If reply is empty but a task was created, generate a confirmation message
    if (!cleanReply && createdTask) {
      const due = createdTask.due_date ? ` due on ${String(createdTask.due_date).split("T")[0]}` : "";
      cleanReply = `✓ Created task "${createdTask.title}" with ${createdTask.priority} priority${due}.`;
    } else if (!cleanReply) {
      cleanReply = "Done!";
    }

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

// GET /api/ai/history — load past chat messages for a user (for frontend persistence)
router.get("/history", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT role, message, timestamp FROM chat_history
       WHERE user_id = $1
       ORDER BY timestamp ASC
       LIMIT 100`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
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

    const systemPrompt = `You are a productivity scheduler. Return ONLY valid JSON — no markdown, no explanation, just raw JSON:
{
  "summary": "Full detailed plan including a list of tasks for today.",
  "schedule": [
    {
      "time": "9:00 AM",
      "task": "exact task title from the list",
      "duration_hours": 1.5,
      "priority": "low|medium|high|urgent",
      "task_id": "the-uuid-from-the-list"
    }
  ]
}

RULES:
- If there are NO tasks provided, return summary: "You have no pending tasks to schedule today. Enjoy your free time!" and an empty schedule array.
- duration_hours MUST be a NUMBER (1, 1.5, 2). Never a string.
- Only schedule tasks from the provided list — use exact titles and IDs
- Working hours: 9 AM to 6 PM. Include a 30-min lunch break at 12:30 PM
- Order by priority: urgent first, then high, then medium, then low
- Leave buffer between tasks`;

    const userMessage = `TODAY: ${new Date().toISOString().split("T")[0]}
Schedule these pending tasks:
${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, due_date: t.due_date })), null, 2)}`;

    const aiReply = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ]);

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
Analyze the existing tasks and return ONLY valid JSON — no markdown, no explanation:
{"updates": [{"id": "uuid", "priority": "high|medium|low", "reason": "brief reason"}]}`;

    const aiReply = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user",   content: JSON.stringify(tasks.rows) },
    ]);

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
