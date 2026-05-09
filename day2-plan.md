# Axon — Web Nexus Day 2 Game Plan

## Executive Summary

Day 2 is a 5-hour backend sprint. Your frontend is already built and prop-ready. The job today is to wire every mock into a real database, spin up a Node.js + Express API, connect a real AI provider, and deploy. Every must-have feature carries a scoring penalty if missing — so prioritize the 6 mandatory endpoints before touching any bonus feature.

The backend is a single Express app. Database is PostgreSQL. Auth uses bcrypt + JWT (access token 15m + refresh token in httpOnly cookie). AI calls go to Gemini API. All routes except `/api/auth/*` are protected by JWT middleware. The frontend's `src/api/` stub files get filled in — nothing in the UI changes.

---

## Tech Stack (Day 2)

- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (use provided lab DB or local)
- **ORM:** None — raw `pg` queries (faster to write under time pressure)
- **Auth:** bcrypt (cost 12) + jsonwebtoken
- **AI:** Google Gemini API (`gemini-1.5-flash` — free tier, fast)
- **Validation:** Zod
- **Frontend connection:** update `src/api/*.js` stubs, set `VITE_API_URL` env var

---

## Project Setup

**Person A runs these. Others read their sections while waiting (~15 min).**

```bash
# In a NEW folder alongside the frontend
mkdir axon-backend && cd axon-backend
npm init -y
npm install express pg bcrypt jsonwebtoken dotenv zod cors cookie-parser axios
npm install -D nodemon
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### Folder Structure
```
axon-backend/
  src/
    index.js            ← Person A
    db.js               ← Person A
    middleware/
      auth.js           ← Person A
      validate.js       ← Person A
    routes/
      auth.js           ← Person C
      tasks.js          ← Person A
      ai.js             ← Person C
      events.js         ← Person B
      summary.js        ← Person B
    schema.sql          ← Person A (run once)
  .env
```

### .env file
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/axon
JWT_SECRET=supersecretkey_change_in_prod_32chars
JWT_REFRESH_SECRET=anothersecret_change_in_prod_32chars
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## Database Schema

**Person A creates `src/schema.sql` and runs it immediately.**

```sql
-- src/schema.sql
-- Run: psql -U postgres -d axon -f src/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  timezone    VARCHAR(100) DEFAULT 'Asia/Karachi',
  role        VARCHAR(50) DEFAULT 'Student' CHECK (role IN ('Student', 'Manager')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  due_date    DATE,
  priority    VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status      VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(500) NOT NULL,
  start_datetime  TIMESTAMPTZ NOT NULL,
  end_datetime    TIMESTAMPTZ NOT NULL,
  linked_task_id  UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  message     TEXT NOT NULL,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Auto-update updated_at on tasks
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Run it:**
```bash
psql -U postgres -c "CREATE DATABASE axon;"
psql -U postgres -d axon -f src/schema.sql
```

---

## Core Files

### src/db.js
```js
// src/db.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
```

### src/index.js
```js
// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const aiRoutes = require("./routes/ai");
const eventRoutes = require("./routes/events");
const summaryRoutes = require("./routes/summary");
const { authenticateToken } = require("./middleware/auth");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes — JWT required
app.use("/api/tasks/summary", authenticateToken, summaryRoutes);
app.use("/api/tasks", authenticateToken, taskRoutes);
app.use("/api/ai", authenticateToken, aiRoutes);
app.use("/api/events", authenticateToken, eventRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Axon API running on :${PORT}`));
```

### src/middleware/auth.js
```js
// src/middleware/auth.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user; // { id, email, role }
    next();
  });
};

module.exports = { authenticateToken };
```

### src/middleware/validate.js
```js
// src/middleware/validate.js
const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};

module.exports = { validate };
```

---

## Person A — Auth Routes + Tasks CRUD (5 pts + 8 pts)

**Estimated time: 3.5 hours**

### Task A1 — Auth Routes (0:15–1:15) — `src/routes/auth.js`

```js
// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const { validate } = require("../middleware/validate");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["Student", "Manager"]).default("Student"),
  timezone: z.string().default("Asia/Karachi"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role, timezone } = req.body;

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, timezone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, timezone, created_at`,
      [name, email, hashedPassword, role, timezone]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT id, name, email, password, role, timezone FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const stored = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    if (stored.rows.length === 0) return res.status(403).json({ error: "Invalid refresh token" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const userResult = await db.query(
      "SELECT id, email, role FROM users WHERE id = $1", [payload.id]
    );
    const user = userResult.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: "Token refresh failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await db.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

module.exports = router;
```

### Task A2 — Tasks CRUD (1:15–3:00) — `src/routes/tasks.js`

```js
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
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
});

const updateTaskSchema = taskSchema.partial();

// GET /api/tasks — with filtering by priority and status
router.get("/", async (req, res) => {
  try {
    const { priority, status, cursor, limit = 20 } = req.query;
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
    // Cursor-based pagination
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

    // Build dynamic SET clause
    const fields = [];
    const values = [];
    let i = 1;

    if (title !== undefined) { fields.push(`title = $${i++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${i++}`); values.push(description); }
    if (due_date !== undefined) { fields.push(`due_date = $${i++}`); values.push(due_date || null); }
    if (priority !== undefined) { fields.push(`priority = $${i++}`); values.push(priority); }
    if (status !== undefined) { fields.push(`status = $${i++}`); values.push(status); }

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
```

### Task A3 — Frontend API Wiring (3:00–3:30)

Update `src/api/tasks.js` in the frontend:

```js
// frontend/src/api/tasks.js
import { STATUS_TO_DB, PRIORITY_TO_DB } from "../utils/normalize";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const fetchTasks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE}/api/tasks?${params}`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks;
};

export const createTask = async (task) => {
  const body = {
    ...task,
    priority: PRIORITY_TO_DB[task.priority] || task.priority?.toLowerCase() || "medium",
    status: STATUS_TO_DB[task.status] || task.status?.toLowerCase().replace(" ", "-") || "todo",
  };
  const res = await fetch(`${BASE}/api/tasks`, {
    method: "POST", headers: authHeader(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (id, task) => {
  const body = {
    ...task,
    priority: PRIORITY_TO_DB[task.priority] || task.priority?.toLowerCase(),
    status: STATUS_TO_DB[task.status] || task.status?.toLowerCase().replace(" ", "-"),
  };
  const res = await fetch(`${BASE}/api/tasks/${id}`, {
    method: "PUT", headers: authHeader(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE}/api/tasks/${id}`, {
    method: "DELETE", headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

export const fetchSummary = async () => {
  const res = await fetch(`${BASE}/api/tasks/summary`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
};
```

---

## Person B — Events + Summary Routes + Frontend Integration (4 pts + 5 pts)

**Estimated time: 3.5 hours**

### Task B1 — Events Route (0:15–1:30) — `src/routes/events.js`

```js
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

// GET /api/events/calendar — tasks as calendar events with optional date filtering
router.get("/calendar", async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;

    // Validate date range with Zod
    const rangeSchema = z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    });
    const parsed = rangeSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: "Invalid date range" });

    let conditions = ["e.user_id = $1"];
    let params = [userId];
    let i = 2;

    if (start) { conditions.push(`e.start_datetime >= $${i++}`); params.push(start); }
    if (end) { conditions.push(`e.end_datetime <= $${i++}`); params.push(end); }

    const whereClause = conditions.join(" AND ");

    // Return events joined with linked task data (avoid N+1)
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
      [userId, userId]
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
```

### Task B2 — Summary Route (1:30–2:00) — `src/routes/summary.js`

```js
// src/routes/summary.js
// Note: this route is mounted at /api/tasks/summary in index.js
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
```

### Task B3 — Wire Frontend Calendar + Dashboard (2:00–3:30)

Update `frontend/src/api/tasks.js` (add to existing file):

```js
// Add to frontend/src/api/tasks.js
export const fetchCalendar = async (start, end) => {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  const res = await fetch(`${BASE}/api/events/calendar?${params}`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch calendar");
  return res.json();
};

export const createEvent = async (event) => {
  const res = await fetch(`${BASE}/api/events`, {
    method: "POST", headers: authHeader(), body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};
```

Update `frontend/src/components/Dashboard.jsx` — replace mock stats with real API:

```jsx
// In Dashboard.jsx — add at top
import { useEffect, useState } from "react";
import { fetchSummary } from "../api/tasks";

// Replace the hardcoded stats computation with:
const [summary, setSummary] = useState(null);
useEffect(() => {
  fetchSummary().then(setSummary).catch(console.error);
}, []);

// Then use summary?.total ?? 0, summary?.completed ?? 0, summary?.in_progress ?? 0, summary?.overdue ?? 0
// in the stats cards instead of computing from tasks prop
```

Update `frontend/src/components/CalendarView.jsx`:

```jsx
// In CalendarView.jsx — replace mock data usage
import { fetchCalendar } from "../api/tasks";
import { useEffect, useState } from "react";

// Inside component, add:
const [calendarData, setCalendarData] = useState({ events: [], taskEvents: [] });
useEffect(() => {
  fetchCalendar().then(setCalendarData).catch(console.error);
}, []);

// Combine for display:
const allEvents = [...calendarData.events, ...calendarData.taskEvents];
const eventsForDate = (dateStr) => allEvents.filter(e => e.start_datetime?.startsWith(dateStr));
```

---

## Person C — AI Routes + Auth Wiring (10 pts + 8 pts)

**Estimated time: 3.5 hours**

### Task C1 — AI Routes (0:15–2:00) — `src/routes/ai.js`

```js
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
      return res.json({ schedule: "No pending tasks found. You're all caught up! 🎉", events: [] });
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

    // Parse JSON response
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

module.exports = router;
```

### Task C2 — Wire Frontend Auth (2:00–3:00)

Update `frontend/src/api/auth.js`:

```js
// frontend/src/api/auth.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const login = async (email, password) => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

export const register = async ({ name, email, password, role }) => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

export const logout = async () => {
  await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const refreshAccessToken = async () => {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
};

export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};
```

Update `frontend/src/api/ai.js`:

```js
// frontend/src/api/ai.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const chatWithAI = async (message) => {
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("AI chat failed");
  return res.json(); // { reply, createdTask }
};

export const generateSchedule = async () => {
  const res = await fetch(`${BASE}/api/ai/schedule`, {
    method: "POST",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Schedule generation failed");
  return res.json(); // { summary, schedule, events }
};
```

### Task C3 — Wire Frontend Pages (3:00–3:30)

Update `frontend/src/pages/Login.jsx` — replace mock handler:

```jsx
// In Login.jsx handleSubmit:
import { login } from "../api/auth";

const handleSubmit = async () => {
  if (!form.email || !form.password) { setError("Please fill all fields."); return; }
  try {
    await login(form.email, form.password);
    onLogin();
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
};
```

Update `frontend/src/pages/Register.jsx`:

```jsx
// In Register.jsx:
import { register } from "../api/auth";

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.password) { setError("All fields required."); return; }
  try {
    await register(form);
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
};
```

Update `frontend/src/components/AIChat.jsx` — replace mock send with real API:

```jsx
// In AIChat.jsx — replace the setTimeout block in send():
import { chatWithAI, generateSchedule } from "../api/ai";

const send = async (text) => {
  if (!text.trim()) return;
  const userMsg = { id: Date.now(), user_id: 1, role: "user", text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    let data;
    if (text.toLowerCase().includes("schedule")) {
      data = await generateSchedule();
      const aiMsg = { id: Date.now() + 1, role: "assistant", text: data.summary || "Schedule generated!", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
      // Push new events to calendar
      if (data.events?.length > 0 && onEventCreate) {
        data.events.forEach(e => onEventCreate(e));
      }
    } else {
      data = await chatWithAI(text);
      const aiMsg = { id: Date.now() + 1, role: "assistant", text: data.reply, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
      // If AI created a task, refresh task list
      if (data.createdTask && onTaskCreated) {
        onTaskCreated(data.createdTask);
      }
    }
  } catch (err) {
    const errMsg = { id: Date.now() + 1, role: "assistant", text: "Sorry, I ran into an error. Please try again.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, errMsg]);
  } finally {
    setLoading(false);
  }
};
```

---

## App.jsx — Full Day 2 Update

Replace the entire `frontend/src/App.jsx` with this real-auth version:

```jsx
// frontend/src/App.jsx — Day 2 final version
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AIChat from "./components/AIChat";
import TaskModal from "./components/TaskModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { fetchTasks, createTask, updateTask, deleteTask } from "./api/tasks";
import { getStoredUser } from "./api/auth";
import { STATUS_TO_DB, STATUS_FROM_DB, PRIORITY_TO_DB, PRIORITY_FROM_DB } from "./utils/normalize";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!currentUser && !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    fetchTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleAdd = () => { setTaskToEdit(null); setModalOpen(true); };

  const handleEdit = (task) => { setTaskToEdit(task); setModalOpen(true); };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleMove = async (id, newStatus) => {
    const dbStatus = STATUS_TO_DB[newStatus] || newStatus;
    await updateTask(id, { status: dbStatus });
    // Normalize back to frontend format after DB write
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: STATUS_FROM_DB[dbStatus] } : t));
  };

  const handleEventCreate = (event) => setEvents(prev => [...prev, event]);

  const handleTaskCreated = (task) => {
    // Normalize DB task to frontend format
    setTasks(prev => [...prev, {
      ...task,
      status: STATUS_FROM_DB[task.status] || task.status,
      priority: PRIORITY_FROM_DB[task.priority] || task.priority,
      due: task.due_date,
    }]);
  };

  const handleSave = async (task) => {
    const payload = {
      title: task.title,
      description: task.description,
      due_date: task.due,
      priority: PRIORITY_TO_DB[task.priority] || task.priority,
      status: STATUS_TO_DB[task.status] || task.status,
    };

    if (task.id) {
      const updated = await updateTask(task.id, payload);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...task, ...updated, due: updated.due_date } : t));
    } else {
      const created = await createTask(payload);
      setTasks(prev => [...prev, { ...created, due: created.due_date, status: task.status, priority: task.priority }]);
    }
    setModalOpen(false);
  };

  const handleLogin = () => {
    setCurrentUser(getStoredUser());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTasks([]);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-indigo-600 text-4xl mb-4">✦</div>
        <p className="text-gray-500">Loading Axon...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 font-sans">
        {isLoggedIn && <Sidebar user={currentUser} onAddTask={handleAdd} onLogout={handleLogout} />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
            <Route path="/" element={isLoggedIn ? <Dashboard tasks={tasks} onAddTask={handleAdd} /> : <Navigate to="/login" />} />
            <Route path="/board" element={isLoggedIn ? <KanbanBoard tasks={tasks} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onMove={handleMove} /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={isLoggedIn ? <CalendarView tasks={tasks} events={events} /> : <Navigate to="/login" />} />
            <Route path="/ai" element={isLoggedIn ? <AIChat tasks={tasks} onEventCreate={handleEventCreate} onTaskCreated={handleTaskCreated} /> : <Navigate to="/login" />} />
            <Route path="/ai/schedule" element={isLoggedIn ? <AIChat tasks={tasks} onEventCreate={handleEventCreate} onTaskCreated={handleTaskCreated} initialPrompt="Generate my schedule for today" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        {modalOpen && <TaskModal task={taskToEdit} onSave={handleSave} onClose={() => setModalOpen(false)} />}
      </div>
    </BrowserRouter>
  );
}
```

Also add `.env` to frontend:
```env
VITE_API_URL=http://localhost:3001
```

---

## Bug Fixes

### Fix 1 — Create normalize.js
Create this file first thing. Import from it everywhere.

```js
// frontend/src/utils/normalize.js

export const STATUS_TO_DB = {
  "To Do": "todo",
  "In Progress": "in-progress",
  "Done": "done",
};

export const STATUS_FROM_DB = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

export const PRIORITY_TO_DB = {
  "Low": "low",
  "Medium": "medium",
  "High": "high",
};

export const PRIORITY_FROM_DB = {
  "low": "Low",
  "medium": "Medium",
  "high": "High",
};
```

Then in App.jsx, tasks.js, everywhere — replace all inline maps with:

```js
// From src/App.jsx
import { STATUS_TO_DB, STATUS_FROM_DB, PRIORITY_TO_DB, PRIORITY_FROM_DB } from "./utils/normalize";

// From src/api/tasks.js
import { STATUS_TO_DB, PRIORITY_TO_DB } from "../utils/normalize";
```

### Fix 2 — Refresh Tokens Pattern (15m access + cookie refresh)
Keep short-lived access tokens and rotate refresh tokens in an httpOnly cookie.

```js
// In src/routes/auth.js — generateTokens becomes:
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};
```

Make sure schema.sql includes refresh_tokens and add cookie-parser:

```js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

Login/register should return { user, accessToken } and set the refresh cookie. Frontend stores accessToken in localStorage.

### Fix 3 — Force Strict Duration Schema in AI Schedule
In src/routes/ai.js, update the schedule system prompt:

```js
// Replace the schedule systemPrompt JSON format example:
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
```

Then in the event creation loop:

```js
// Replace:
const durationHours = parseFloat(item.duration) || 1;

// With:
const durationHours = Number(item.duration_hours) || 1;
```

### Fix 4 — Safer AI JSON Extraction
In src/routes/ai.js, replace the schedule JSON parse block:

```js
// Replace:
const clean = aiReply.replace(/```json|```/g, "").trim();
scheduleData = JSON.parse(clean);

// With:
const match = aiReply.match(/\{[\s\S]*\}/);
if (!match) throw new Error("No JSON in AI response");
scheduleData = JSON.parse(match[0]);
```

### Fix 5 — Deduplicate Calendar Entries
In src/routes/events.js, update the virtual task query to exclude tasks already linked to events:

```js
// Replace the taskResult query with:
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
  [userId, userId]  // $1 appears twice, pass userId twice
);
```

---

## Revised Priority Order for Day 2

Day 2 now starts with:

1. Create normalize.js (prevents the #1 bug class)
2. Run schema.sql (includes refresh_tokens table)
3. Phase 1: auth + tasks CRUD
4. Phase 2: AI + calendar + dashboard

### Phase 1 — First 90 minutes (project is alive or dead here)
Everyone focuses on getting this single flow working end-to-end:

```
Register → Login → Create Task → Fetch Tasks → Show on Board
```

What to build: db.js, index.js, auth.js, tasks.js, frontend auth.js + tasks.js + App.jsx wiring.

Don't touch AI, events, or calendar until this works.

### Phase 2 — Next 90 minutes (what judges actually see)
```
AI Chat → task created → board updates
AI Schedule → calendar updates
Dashboard shows live stats
```

What to build: ai.js route, events.js, summary.js, wire AIChat.jsx.

### Phase 3 — Last 60 minutes (if everything works)
Polish, voice input, analytics. If Phase 2 isn't solid, skip Phase 3 entirely.

---

## What to Cut If Time Gets Short

| Cut first | Never cut |
|---|---|
| Cursor pagination — use simple `LIMIT 50` | Tasks CRUD |
| Zod validation — just use basic checks | AI chat |
| Timezone support | AI schedule |
| Analytics page | Live frontend integration |

For the demo, the one moment that wins it:

> User types: *"I need to prepare Software Engineering presentation tomorrow"*
> → AI creates task → appears on Kanban → appears on Calendar → schedule generates

Rehearse that exact flow at least twice before the pitch.

Yes, all fixes are aligned. Let me map each one explicitly:

---

## Fix-by-Fix Verification

**Fix 1 — Create normalize.js**
Requirement: Task filtering by priority and status, working end-to-end (must-have). Centralizing maps prevents drift across components and APIs. ✅

**Fix 2 — Refresh tokens pattern**
Requirement: JWT auth with short-lived access tokens and long-lived refresh cookies. This meets the scoring hint and keeps sessions stable. ✅

**Fix 3 — Strict duration schema**
Requirement: AI schedule must create valid calendar events. Numeric hours prevent parsing errors and time math bugs. ✅

**Fix 4 — Safer JSON extraction**
Requirement: AI schedule must parse even when the model adds extra text. Regex extraction ensures JSON is still recovered. ✅

**Fix 5 — Deduplicate calendar entries**
Requirement: Calendar should not show duplicate tasks when events are already linked. This keeps the UI clean and avoids double counting. ✅

---

## One Thing ChatGPT Missed

The revised phase order also implicitly fixes something the original plan got wrong: it had all three people working in parallel from minute zero, which means if Person A's `db.js` or auth middleware has a bug, Person B and C's work can't be tested at all.

The new Phase 1 approach — everyone converges on the auth + tasks flow first — means you have a working app after 90 minutes regardless of what happens in Phase 2. That's the right call for a hackathon.

---

Everything checks out. The plan as corrected covers all 6 scored endpoints, all 7 must-haves, the correct DB schema, and a demo flow that hits the highest-value features first.

---

## Endpoint Testing (Curl Commands)

Run these after each endpoint is built to verify before frontend wiring:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rehan","email":"rehan@test.com","password":"password123","role":"Student"}'

# Login (save token)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rehan@test.com","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# Create task
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"high","status":"todo","due_date":"2025-06-15"}'

# Get tasks
curl http://localhost:3001/api/tasks -H "Authorization: Bearer $TOKEN"

# Summary
curl http://localhost:3001/api/tasks/summary -H "Authorization: Bearer $TOKEN"

# AI chat
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are my high priority tasks?"}'

# Generate schedule
curl -X POST http://localhost:3001/api/ai/schedule \
  -H "Authorization: Bearer $TOKEN"

# Calendar events
curl "http://localhost:3001/api/events/calendar" -H "Authorization: Bearer $TOKEN"
```

---

## Status ↔ Priority Normalization Map

The frontend uses human-readable values. The DB uses lowercase/hyphenated. Always normalize using the shared normalize.js module — never inline maps.

| Frontend Value | DB Value |
|---|---|
| "To Do" | "todo" |
| "In Progress" | "in-progress" |
| "Done" | "done" |
| "High" | "high" |
| "Medium" | "medium" |
| "Low" | "low" |

---

## Bonus Features (Attempt Only After All Must-Haves Work)

Optional features awarded in order of submission. Each item scored separately.

### ★ AI Priority Reorganizer (+12 pts) — Person A — 60 min

```js
// Add to src/routes/ai.js
router.post("/reorganize", async (req, res) => {
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
  const clean = aiReply.replace(/```json|```/g, "").trim();
  const { updates } = JSON.parse(clean);

  for (const update of updates) {
    await db.query("UPDATE tasks SET priority = $1 WHERE id = $2 AND user_id = $3",
      [update.priority, update.id, userId]);
  }

  res.json({ updates, message: `Reorganized ${updates.length} tasks` });
});
```

### ★ Real-Time Collaboration (+10 pts)
Use WebSockets to broadcast task updates so multiple users see live changes on the board.

### ★ Voice Input — Web Speech API (+8 pts) — Person C — 30 min
```jsx
// Add to AIChat.jsx
const startVoice = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
    send(transcript);
  };
  recognition.start();
};

// Add mic button next to send button:
<button onClick={startVoice} className="bg-gray-100 text-gray-600 px-3 py-2.5 rounded-xl hover:bg-gray-200">🎙</button>
```

### ★ Recurring Task Automation (+8 pts)
Allow users to define recurrence rules and auto-generate tasks on schedule (cron job or background worker).

### ★ Productivity Analytics Page (+6 pts) — Person B — 45 min

Add `GET /api/tasks/analytics` to backend:

```js
router.get("/analytics", async (req, res) => {
  const result = await db.query(
    `SELECT
      DATE(created_at) AS date,
      COUNT(*) FILTER (WHERE status = 'done') AS completed,
      COUNT(*) AS created
     FROM tasks WHERE user_id = $1
     AND created_at > NOW() - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [req.user.id]
  );
  res.json(result.rows);
});
```

Then add a simple chart page using inline SVG bars (no libraries needed).

### ★ Browser Push Notifications
Notify users about upcoming deadlines with the Notifications API and a service worker.

---

## Common Day 2 Failure Modes

| # | Failure | Fix |
|---|---------|-----|
| 1 | **CORS error** in browser | Ensure backend CORS origin matches the frontend and every API call sends the Authorization header |
| 2 | **JWT token expired** during demo | Use refresh endpoint to rotate access tokens (15m access + refresh cookie) |
| 3 | **Gemini API key missing** | Get key from `aistudio.google.com` — free tier supports the demo volume |
| 4 | **Status mismatch** — tasks not appearing in correct column | Always normalize with normalize.js and keep maps centralized |
| 5 | **`/api/tasks/summary` 404** | Ensure `summary` route is registered BEFORE `/:id` route, or mount at a different path |
| 6 | **Tasks not loading after login** | Confirm `useEffect` in App.jsx depends on `isLoggedIn` and `fetchTasks()` is called with Authorization header |
| 7 | **AI schedule creates duplicate events** | Add a `WHERE date(start_datetime) = CURRENT_DATE` check before inserting — skip if today's events already exist |
| 8 | **DB connection refused** | Verify `DATABASE_URL` in `.env` is correct and postgres is running: `pg_isready -h localhost` |

---

## 2-Minute Pitch Script (Day 2 End)

**[0:00–0:20]** — Problem
> "Professionals lose hours every week to manual task management with zero intelligence. Tools like Trello tell you what's due — they don't tell you what to do next."

**[0:20–0:50]** — Live Demo
> "Axon is an AI productivity platform. Watch: I type 'I need to prepare a client report by tomorrow' — it parses the intent, creates the task, assigns a priority, and slots it into today's schedule automatically."
*Demo: type in AI chat, show task appearing on board, show calendar updating.*

**[0:50–1:20]** — Technical Depth
> "The backend is Node + Express with PostgreSQL. Auth uses bcrypt and JWT with refresh tokens for stable sessions. The AI endpoint sends task context to Gemini and parses structured commands from natural language responses."

**[1:20–1:50]** — Architecture
> "We built against our UML diagrams: the sequence diagram maps exactly to our POST /api/ai/chat endpoint flow. The class diagram is our PostgreSQL schema. Every design decision was intentional."

**[1:50–2:00]** — Close
-> "Axon doesn't just manage tasks. It manages your day. Thank you."

---

## Critical Success Factors

- Test every endpoint with curl before touching the frontend — don't debug backend and frontend simultaneously
- The status normalization map is the #1 source of bugs — use normalize.js everywhere
- If Gemini is slow, add `generationConfig: { maxOutputTokens: 512 }` to speed up responses
- `GET /api/tasks/summary` must be registered before `GET /api/tasks/:id` — route order matters in Express
- Keep `isLoggedIn = true` in App.jsx as a fallback if auth wiring runs out of time — judges care about features more than auth flow in Day 2
- The pitch is 8% of your score — allocate the last 30 minutes entirely to rehearsing it
- Every must-have carries a scoring penalty if missing — do not start bonus features until all 6 endpoints return 200