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
    // Allow any localhost origin (handles Vite's auto-port-increment)
    if (!origin || origin.startsWith("http://localhost") || origin === process.env.FRONTEND_URL) {
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
