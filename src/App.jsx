// src/App.jsx
// Person A — integration hub. All state lives here; every component gets data via props.
// Day 2: replace useState(mockTasks) with await fetchTasks(), replace isLoggedIn with JWT check.

import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar      from "./components/Sidebar";
import Dashboard    from "./components/Dashboard";
import KanbanBoard  from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AIChat       from "./components/AIChat";
import TaskModal    from "./components/TaskModal";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import { mockTasks, mockEvents, mockUser } from "./data/mockTasks";
import gradiantBg from "./gradiant.png";

export default function App() {
  // ── Core data state ────────────────────────────────────────
  const [tasks,       setTasks]      = useState(mockTasks);
  const [events,      setEvents]     = useState(mockEvents);
  const [currentUser]                = useState(mockUser);
  const [isLoggedIn,  setIsLoggedIn] = useState(true); // true = demo mode; Day 2: JWT

  // ── Modal state ────────────────────────────────────────────
  const [modalOpen,   setModalOpen]  = useState(false);
  const [taskToEdit,  setTaskToEdit] = useState(null); // null = create, object = edit

  // ── Handlers (lifted to App; passed down as props) ─────────
  const handleAdd    = ()       => { setTaskToEdit(null);  setModalOpen(true); };
  const handleEdit   = (task)   => { setTaskToEdit(task);  setModalOpen(true); };
  const handleDelete = (id)     => setTasks(prev => prev.filter(t => t.id !== id));
  const handleMove   = (id, newStatus) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

  const handleEventCreate = (event) =>
    setEvents(prev => [...prev, event]);

  const handleSave = (task) => {
    if (task.id) {
      // Edit path — spread to avoid mutation (plan failure mode #5)
      setTasks(prev => prev.map(t => t.id === task.id ? { ...task } : t));
    } else {
      // Create path
      setTasks(prev => [...prev, { ...task, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const closeModal = () => setModalOpen(false);

  // ── Auth guard ─────────────────────────────────────────────
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      {/* Outer shell: sidebar fixed left, main scrolls right */}
      <div 
        className="relative flex h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${gradiantBg})`,
          backgroundColor: '#1A1A1A'
        }}
      >
        {/* App-wide scrim */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: "rgba(0,0,0,0.15)" }}
        />

        {/* Content container (above scrim) */}
        <div className="relative z-10 flex h-full w-full">
          <Sidebar user={currentUser} onAddTask={handleAdd} />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto min-w-0">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  tasks={tasks}
                  onAddTask={handleAdd}
                />
              }
            />
            <Route
              path="/board"
              element={
                <KanbanBoard
                  tasks={tasks}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <CalendarView
                  tasks={tasks}
                  events={events}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                />
              }
            />
            <Route
              path="/ai"
              element={
                <AIChat
                  tasks={tasks}
                  onEventCreate={handleEventCreate}
                />
              }
            />
            <Route
              path="/ai/schedule"
              element={
                <AIChat
                  tasks={tasks}
                  onEventCreate={handleEventCreate}
                  initialPrompt="Generate my schedule for today"
                />
              }
            />
            <Route
              path="/login"
              element={<Login onLogin={() => setIsLoggedIn(true)} />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
            {/* Catch-all → dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>

        {/* Global task modal — rendered at App level so it overlays everything */}
        {modalOpen && (
          <TaskModal
            task={taskToEdit}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </div>
    </BrowserRouter>
  );
}