require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes    = require("./routes/auth");
const taskRoutes    = require("./routes/tasks");
const aiRoutes      = require("./routes/ai");
const eventRoutes   = require("./routes/events");
const summaryRoutes = require("./routes/summary");
const { authenticateToken } = require("./middleware/auth");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin or any Vercel domain dynamically
    if (
      !origin || 
      origin.startsWith("http://localhost") || 
      origin === process.env.FRONTEND_URL ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Public routes
// Temporary migration route to fix DB schema on Render
app.get("/api/migrate", async (req, res) => {
  const results = [];
  try {
    // 1. Add column
    try {
      await db.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_rule TEXT");
      results.push("Column recurring_rule added (or already exists)");
    } catch (e) { results.push("Column error: " + e.message); }

    // 2. Update priority constraint
    try {
      // Try to drop common default names
      await db.query("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check");
      await db.query("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");
      results.push("Priority constraint updated to include 'urgent'");
    } catch (e) { 
      results.push("Constraint error: " + e.message + ". Trying fallback...");
      // Fallback: try to just modify it if possible or ignore if it's already there
      try {
         await db.query("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check_v2 CHECK (priority IN ('low', 'medium', 'high', 'urgent'))");
         results.push("Fallback constraint v2 added");
      } catch (e2) { results.push("Fallback error: " + e2.message); }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message, partial_results: results });
  }
});

app.use("/api/auth", authRoutes);

// Protected routes — JWT required
// IMPORTANT: summary must be mounted BEFORE /:id route
app.use("/api/tasks/summary", authenticateToken, summaryRoutes);
app.use("/api/tasks",         authenticateToken, taskRoutes);
app.use("/api/ai",            authenticateToken, aiRoutes);
app.use("/api/events",        authenticateToken, eventRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Axon API running on :${PORT}`));
