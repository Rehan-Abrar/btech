// frontend/src/App.jsx — Day 2 Production Version
// Real JWT auth. Login is the entry point. No mock data.

import { useState, useEffect, useMemo } from "react";
import { generateRecurringTasks } from "./services/recurringTaskEngine";
import { prioritizeTasks } from "./services/aiPrioritizer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar      from "./components/Sidebar";
import Dashboard    from "./components/Dashboard";
import KanbanBoard  from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AIChat       from "./components/AIChat";
import TaskModal    from "./components/TaskModal";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import { fetchTasks, createTask, updateTask, deleteTask } from "./api/tasks";
import { logout as apiLogout, getStoredUser } from "./api/auth";
import { STATUS_TO_DB, STATUS_FROM_DB, PRIORITY_FROM_DB, PRIORITY_TO_DB } from "./utils/normalize";
import useTaskNotifications from "./hooks/useTaskNotifications";
import gradiantBg from "./gradiant.png";

export default function App() {
  const [tasks,       setTasks]      = useState([]);
  const [events,      setEvents]     = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [modalOpen,   setModalOpen]  = useState(false);
  const [taskToEdit,  setTaskToEdit] = useState(null);
  const [loading,     setLoading]    = useState(true);

  const isLoggedIn = !!currentUser && !!localStorage.getItem("accessToken");

  // Apply recurring engine to generate virtual future tasks
  const displayTasks = useMemo(() => generateRecurringTasks(tasks), [tasks]);

  // Enable notifications
  useTaskNotifications(displayTasks);

  // Load tasks when user logs in
  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    setLoading(true);
    fetchTasks()
      .then(raw => setTasks(raw.map(normalizeTask)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Normalize a DB task row to frontend format
  const normalizeTask = (t) => ({
    ...t,
    status:   STATUS_FROM_DB[t.status]   || t.status,
    priority: PRIORITY_FROM_DB[t.priority] || t.priority,
    due:      t.due_date || t.due || "",
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleAdd  = ()     => { setTaskToEdit(null);  setModalOpen(true); };
  const handleEdit = (task) => { setTaskToEdit(task);  setModalOpen(true); };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleMove = async (id, newStatus) => {
    const dbStatus = STATUS_TO_DB[newStatus] || newStatus;
    try {
      await updateTask(id, { status: dbStatus });
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: STATUS_FROM_DB[dbStatus] || newStatus } : t
      ));
    } catch (err) { console.error(err); }
  };

  const handleSave = async (formTask) => {
    // 1. Run AI Prioritization before hitting DB
    const { tasks: prioritizedTasks, incomingTask, summary } = prioritizeTasks(tasks, formTask);

    if (summary.changed) {
      console.log(summary.message); // Could be a toast notification later
    }

    const payload = {
      title:       incomingTask.title,
      description: incomingTask.description || "",
      due_date:    incomingTask.due || null,
      priority:    PRIORITY_TO_DB[incomingTask.priority] || incomingTask.priority?.toLowerCase() || "medium",
      status:      STATUS_TO_DB[incomingTask.status]     || incomingTask.status?.toLowerCase().replace(" ", "-") || "todo",
    };

    try {
      if (formTask.id) {
        const updated = await updateTask(formTask.id, payload);
        setTasks(prev => prev.map(t => t.id === formTask.id ? normalizeTask(updated) : t));
      } else {
        const created = await createTask(payload);
        setTasks(prev => [...prev, normalizeTask(created)]);
      }

      // 2. If AI reprioritized other tasks, update them in DB
      if (summary.changed) {
        const changedTasks = prioritizedTasks.filter(pt => {
          const original = tasks.find(t => t.id === pt.id);
          return original && original.priority !== pt.priority;
        });

        for (const ct of changedTasks) {
          try {
            const dbPrio = PRIORITY_TO_DB[ct.priority] || ct.priority?.toLowerCase() || "medium";
            await updateTask(ct.id, { priority: dbPrio });
            setTasks(prev => prev.map(t => t.id === ct.id ? { ...t, priority: ct.priority } : t));
          } catch (err) {
            console.error("Failed to auto-update priority", err);
          }
        }
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventCreate = (event) => setEvents(prev => [...prev, event]);

  const handleTaskCreated = (task) => {
    setTasks(prev => [...prev, normalizeTask(task)]);
  };

  const handleLogin = () => {
    setCurrentUser(getStoredUser());
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setTasks([]);
    setEvents([]);
  };

  // ── Loading spinner (AXON branded) ──────────────────────────
  if (loading && isLoggedIn) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${gradiantBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1A1A1A",
        }}
      >
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 animate-pulse">
            <path d="M13.2 2L5.8 13H11L9.8 22L18.2 10.8H13.6L13.2 2Z" fill="#D4AF37" />
          </svg>
          <p style={{ color: "#87CEEB", fontFamily: "JetBrains Mono, monospace", fontSize: "14px" }}>
            Loading Axon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div
        className="relative flex h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${gradiantBg})`,
          backgroundColor: "#1A1A1A",
        }}
      >
        {/* App-wide dark scrim */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: "rgba(0,0,0,0.15)" }}
        />

        {/* Content above scrim */}
        <div className="relative z-10 flex h-full w-full">
          {isLoggedIn && (
            <Sidebar user={currentUser} onAddTask={handleAdd} onLogout={handleLogout} />
          )}

          <main className="flex-1 overflow-y-auto min-w-0">
            <Routes>
              {/* Auth routes — redirect to "/" if already logged in */}
              <Route
                path="/login"
                element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
              />
              <Route
                path="/register"
                element={isLoggedIn ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />}
              />

              {/* Protected routes — redirect to "/login" if not logged in */}
              <Route
                path="/"
                element={isLoggedIn
                  ? <Dashboard tasks={displayTasks} onAddTask={handleAdd} />
                  : <Navigate to="/login" replace />}
              />
              <Route
                path="/board"
                element={isLoggedIn
                  ? <KanbanBoard tasks={displayTasks} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onMove={handleMove} />
                  : <Navigate to="/login" replace />}
              />
              <Route
                path="/calendar"
                element={isLoggedIn
                  ? <CalendarView tasks={displayTasks} events={events} onAdd={handleAdd} onEdit={handleEdit} />
                  : <Navigate to="/login" replace />}
              />
              <Route
                path="/ai"
                element={isLoggedIn
                  ? <AIChat tasks={displayTasks} onEventCreate={handleEventCreate} onTaskCreated={handleTaskCreated} />
                  : <Navigate to="/login" replace />}
              />
              <Route
                path="/ai/schedule"
                element={isLoggedIn
                  ? <AIChat tasks={displayTasks} onEventCreate={handleEventCreate} onTaskCreated={handleTaskCreated} initialPrompt="Generate my schedule for today" />
                  : <Navigate to="/login" replace />}
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
            </Routes>
          </main>
        </div>

        {/* Global task modal */}
        {modalOpen && (
          <TaskModal
            task={taskToEdit}
            onSave={handleSave}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}