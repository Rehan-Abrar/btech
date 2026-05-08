# Axon — Web Nexus Day 1 Game Plan

## Executive Summary

This document is the single source of truth for your 3-person team during the Day 1 frontend sprint. You have approximately 3.5–4 hours to deliver a fully interactive React + Tailwind CSS application demonstrating task management, AI chat, calendar, filtering, and dashboard — all powered by mock data. Every component must be prop-driven and structured so that Day 2 backend wiring requires zero refactoring of UI logic. The updated plan also keeps the UI aligned with the Gemini diagrams by making navigation role-aware, introducing a first-class Event model, and wiring the AI schedule flow into the calendar.

### Diagram Alignment Notes

- Student users see Tasks + AI Chat as the primary workflow.
- Manager users see Calendar + Schedule actions as the primary workflow.
- Calendar data is driven by Event records linked to tasks through `task_id`.
- Chat history entries carry both `role` and `user_id` so Day 2 persistence is straightforward.

The plan divides work into three parallel tracks: Person A owns the app shell, dashboard, and kanban board; Person B owns the task modal, filtering, and calendar; Person C owns the AI chat panel, auth pages, and empty states. All three converge at three defined checkpoints. Read your own section fully before writing a single line of code.

---

## Tech Stack (Non-Negotiable)

- **Framework:** React (Vite scaffold)
- **Styling:** Tailwind CSS
- **State:** useState / props lifting — no Redux, no Context API
- **No external UI libraries** — build components from scratch for judge credibility
- **Drag-and-drop:** Manual button-based column moves only (saves time)

---

## Project Setup

**Person A runs these commands. Everyone else waits until setup is done (~10 min).**

```bash
npm create vite@latest axon -- --template react
cd axon
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom
```

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### src/index.css (replace entire file)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Final Folder Structure
```
src/
  api/
    tasks.js          ← stub file, empty for now
    auth.js           ← stub file, empty for now
    ai.js             ← stub file, empty for now
  components/
    Sidebar.jsx       ← Person A
    Dashboard.jsx     ← Person A
    KanbanBoard.jsx   ← Person A
    TaskCard.jsx      ← Person A
    TaskModal.jsx     ← Person B
    FilterBar.jsx     ← Person B
    CalendarView.jsx  ← Person B
    AIChat.jsx        ← Person C
    ChatBubble.jsx    ← Person C
    EmptyState.jsx    ← Person C
  pages/
    Login.jsx         ← Person C
    Register.jsx      ← Person C
  data/
    mockTasks.js      ← Person A creates, all use
    mockChats.js      ← Person C creates
  App.jsx             ← Person A
  main.jsx            ← untouched
```

---

## Mock Data Schema

**Person A creates `src/data/mockTasks.js` immediately after setup.**

```js
// src/data/mockTasks.js

export const PRIORITIES = ["High", "Medium", "Low"];
export const STATUSES = ["To Do", "In Progress", "Review", "Done"];

export const mockTasks = [
  { id: 1, title: "Design landing page mockups", description: "Create wireframes for homepage and about page.", priority: "High", status: "In Progress", due: "2025-06-10", assignee: "Alex", tags: ["Design", "UI"] },
  { id: 2, title: "Write REST API documentation", description: "Document all endpoints with request/response examples.", priority: "Medium", status: "To Do", due: "2025-06-14", assignee: "Sam", tags: ["Docs"] },
  { id: 3, title: "Fix authentication bug", description: "JWT token not refreshing on session expiry.", priority: "High", status: "Done", due: "2025-06-08", assignee: "Jordan", tags: ["Bug", "Auth"] },
  { id: 4, title: "Setup PostgreSQL schema", description: "Define tables for users, tasks, and audit logs.", priority: "Low", status: "Review", due: "2025-06-12", assignee: "Alex", tags: ["Database"] },
  { id: 5, title: "Implement task filtering", description: "Add priority and status filters to kanban view.", priority: "Medium", status: "In Progress", due: "2025-06-11", assignee: "Sam", tags: ["Feature"] },
  { id: 6, title: "Deploy staging environment", description: "Configure Docker Compose for staging.", priority: "High", status: "To Do", due: "2025-06-15", assignee: "Jordan", tags: ["DevOps"] },
  { id: 7, title: "Write unit tests for task service", description: "Cover CRUD operations with Vitest.", priority: "Low", status: "To Do", due: "2025-06-16", assignee: "Alex", tags: ["Testing"] },
  { id: 8, title: "Create onboarding flow", description: "Step-by-step guide for new users.", priority: "Medium", status: "Done", due: "2025-06-07", assignee: "Sam", tags: ["UX"] },
];

export const mockEvents = [
  { id: 1, task_id: 1, title: "Design landing page mockups", start: "2025-06-10T09:00", end: "2025-06-10T11:00" },
  { id: 2, task_id: 3, title: "Fix authentication bug", start: "2025-06-08T14:00", end: "2025-06-08T15:30" },
  { id: 3, task_id: 5, title: "Implement task filtering", start: "2025-06-11T10:00", end: "2025-06-11T12:00" },
  { id: 4, task_id: 6, title: "Deploy staging environment", start: "2025-06-15T13:00", end: "2025-06-15T15:00" },
];

export const mockUser = {
  id: 1,
  name: "Demo User",
  email: "demo@axon.app",
  role: "Student",
  avatar: "DU",
};
```

**Person C creates `src/data/mockChats.js` immediately after setup.**

```js
// src/data/mockChats.js

export const mockResponses = {
  default: "I've analyzed your tasks. You have 3 high-priority items due this week. Want me to generate a schedule?",
  schedule: "Here's your optimized schedule for today:\n• 9:00 AM – Fix authentication bug (High)\n• 11:00 AM – Design landing page mockups\n• 2:00 PM – Implement task filtering\n• 4:00 PM – Review PR for DB schema",
  overdue: "You have 1 overdue task: 'Fix authentication bug' was due June 8th. It's now marked Done — great work!",
  priority: "Your top 3 high-priority tasks:\n1. Design landing page mockups (Due Jun 10)\n2. Fix authentication bug (Done ✓)\n3. Deploy staging environment (Due Jun 15)",
  create: "Task created successfully! I've added it to your To Do column and scheduled a reminder for the due date.",
};

export const initialMessages = [
  { id: 1, user_id: 1, role: "assistant", text: "Hi there! I'm your AI assistant. I can help you manage tasks, generate schedules, and automate workflows. Try asking me something!", timestamp: "09:00 AM" },
];
```

---

## Component Hierarchy & Prop Contracts

```
App.jsx
├── <Sidebar user={currentUser} onAddTask={handleAdd} />
├── <Dashboard tasks={tasks} />
├── <KanbanBoard
│     tasks={tasks}
│     onAdd={handleAdd}
│     onEdit={handleEdit}
│     onDelete={handleDelete}
│     onMove={handleMove} />
│   ├── <FilterBar
│         onFilterChange={setFilters} />
│   └── <TaskCard
│         task={task}
│         onEdit={onEdit}
│         onDelete={onDelete}
│         onMove={onMove} />
├── <CalendarView tasks={tasks} events={events} />
├── <AIChat tasks={tasks} onEventCreate={handleEventCreate} />
└── <TaskModal
      task={taskToEdit}       ← null = create mode, object = edit mode
      onSave={handleSave}
      onClose={closeModal} />
```

---

## Person A — App Shell, Dashboard, Kanban

**Estimated time: 3.5 hours**

### Task A1 — Project Setup & Routing (0:00–0:20)
- Run all setup commands above
- Create the full folder structure with empty files
- Set up `App.jsx` with React Router:

```jsx
// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AIChat from "./components/AIChat";
import TaskModal from "./components/TaskModal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { mockTasks, mockEvents, mockUser } from "./data/mockTasks";

export default function App() {
  const [tasks, setTasks] = useState(mockTasks);
  const [events, setEvents] = useState(mockEvents);
  const [currentUser] = useState(mockUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // set true for demo

  const handleAdd = () => { setTaskToEdit(null); setModalOpen(true); };
  const handleEdit = (task) => { setTaskToEdit(task); setModalOpen(true); };
  const handleDelete = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleMove = (id, newStatus) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  const handleEventCreate = (event) => setEvents(prev => [...prev, event]);
  const handleSave = (task) => {
    if (task.id) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, { ...task, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar user={currentUser} onAddTask={handleAdd} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} onAddTask={handleAdd} />} />
            <Route path="/board" element={<KanbanBoard tasks={tasks} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onMove={handleMove} />} />
            <Route path="/calendar" element={<CalendarView tasks={tasks} events={events} />} />
            <Route path="/ai" element={<AIChat tasks={tasks} onEventCreate={handleEventCreate} />} />
            <Route path="/ai/schedule" element={<AIChat tasks={tasks} onEventCreate={handleEventCreate} initialPrompt="Generate my schedule for today" />} />
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        {modalOpen && <TaskModal task={taskToEdit} onSave={handleSave} onClose={() => setModalOpen(false)} />}
      </div>
    </BrowserRouter>
  );
}
```

### Task A2 — Sidebar (0:20–0:40)
- Create `src/components/Sidebar.jsx`
- Fixed left sidebar, 64px wide collapsed / 240px expanded
- Nav links adapt to `user.role`: Student gets Dashboard + My Tasks + AI Chat; Manager gets Dashboard + Calendar + Get Schedule
- User avatar at bottom with name and role
- Active link highlighted in indigo

```jsx
// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { mockUser } from "../data/mockTasks";

const studentLinks = [
  { to: "/", icon: "⊞", label: "Dashboard" },
  { to: "/board", icon: "◫", label: "My Tasks" },
  { to: "/ai", icon: "✦", label: "AI Chat" },
];

const managerLinks = [
  { to: "/", icon: "⊞", label: "Dashboard" },
  { to: "/calendar", icon: "▦", label: "Calendar" },
  { to: "/ai/schedule", icon: "◈", label: "Get Schedule" },
];

export default function Sidebar({ user, onAddTask }) {
  const links = user?.role === "Manager" ? managerLinks : studentLinks;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col py-6 px-4 shrink-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-indigo-600">✦ Axon</h1>
        <p className="text-xs text-gray-400 mt-1">AI Task Automation</p>
      </div>
      <button onClick={onAddTask} className="mb-6 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
        + New Task
      </button>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
            <span>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{mockUser.avatar}</div>
          <div>
            <p className="text-sm font-medium text-gray-800">{mockUser.name}</p>
            <p className="text-xs text-gray-400">{mockUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### Task A3 — Dashboard (0:40–1:20)
Create `src/components/Dashboard.jsx`. Compute all stats from the `tasks` prop — never hardcode numbers.

```jsx
// src/components/Dashboard.jsx
import EmptyState from "./EmptyState";

const PRIORITY_COLORS = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };

export default function Dashboard({ tasks, onAddTask }) {
  const today = new Date().toISOString().split("T")[0];
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const overdue = tasks.filter(t => t.due < today && t.status !== "Done").length;

  const stats = [
    { label: "Total Tasks", value: total, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Completed", value: done, color: "bg-green-50 text-green-700 border-green-200" },
    { label: "In Progress", value: inProgress, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Overdue", value: overdue, color: "bg-red-50 text-red-700 border-red-200" },
  ];

  const recent = [...tasks].sort((a, b) => a.id - b.id).slice(-5).reverse();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good morning 👋</h2>
          <p className="text-gray-500 mt-1">Here's today's overview.</p>
        </div>
        <button onClick={onAddTask} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          + Add Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
        {recent.length === 0 ? <EmptyState message="No tasks yet. Create your first one!" /> : (
          <div className="divide-y divide-gray-100">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">Due {t.due} · {t.assignee}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Task A4 — KanbanBoard (1:20–2:20)
Create `src/components/KanbanBoard.jsx` and `src/components/TaskCard.jsx`.

```jsx
// src/components/KanbanBoard.jsx
import { useState } from "react";
import TaskCard from "./TaskCard";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";

const COLUMNS = ["To Do", "In Progress", "Review", "Done"];
const COL_COLORS = { "To Do": "bg-gray-100", "In Progress": "bg-blue-50", "Review": "bg-yellow-50", "Done": "bg-green-50" };

export default function KanbanBoard({ tasks, onAdd, onEdit, onDelete, onMove }) {
  const [filters, setFilters] = useState({ priority: "All", status: "All" });

  const filtered = tasks.filter(t =>
    (filters.priority === "All" || t.priority === filters.priority)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
        <button onClick={onAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ New Task</button>
      </div>
      <FilterBar onFilterChange={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col);
          return (
            <div key={col} className={`rounded-xl p-4 ${COL_COLORS[col]} min-h-64`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{col}</h3>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border">{colTasks.length}</span>
              </div>
              {colTasks.length === 0
                ? <EmptyState message={`No ${col.toLowerCase()} tasks`} small />
                : colTasks.map(t => (
                  <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onMove={onMove} allStatuses={COLUMNS} />
                ))
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

```jsx
// src/components/TaskCard.jsx
const PRIORITY_COLORS = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };

export default function TaskCard({ task, onEdit, onDelete, onMove, allStatuses }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>📅 {task.due}</span>
        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">{task.assignee[0]}</span>
      </div>
      <div className="flex items-center gap-1">
        <select
          value={task.status}
          onChange={e => onMove(task.id, e.target.value)}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 flex-1 bg-white"
        >
          {allStatuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => onEdit(task)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Edit</button>
        <button onClick={() => onDelete(task.id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">Del</button>
      </div>
    </div>
  );
}
```

---

## Person B — Task Modal, Filter Bar, Calendar

**Estimated time: 3.5 hours**

### Task B1 — FilterBar (0:40–1:00)
Create `src/components/FilterBar.jsx`. Filter logic lives in the parent (KanbanBoard), not here.

```jsx
// src/components/FilterBar.jsx
export default function FilterBar({ onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div className="flex flex-wrap gap-3 mb-2">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
        <select onChange={e => handleChange("priority", e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
        <select onChange={e => handleChange("status", e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Done">Done</option>
        </select>
      </div>
    </div>
  );
}
```

### Task B2 — TaskModal (1:00–1:50)

```jsx
// src/components/TaskModal.jsx
import { useState, useEffect } from "react";

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", status: "To Do", due: "", assignee: "", tags: [] });

  useEffect(() => {
    if (task) setForm(task);
  }, [task]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) return alert("Title is required");
    if (!form.due) return alert("Due date is required");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">×</button>
        <h2 className="text-lg font-bold text-gray-900 mb-5">{task ? "Edit Task" : "New Task"}</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
            <input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="Task title..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} placeholder="What needs to be done?" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select value={form.priority} onChange={e => handleChange("priority", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => handleChange("status", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option>To Do</option><option>In Progress</option><option>Review</option><option>Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date *</label>
              <input type="date" value={form.due} onChange={e => handleChange("due", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <input value={form.assignee} onChange={e => handleChange("assignee", e.target.value)} placeholder="Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Task B3 — CalendarView (1:50–3:00)

```jsx
// src/components/CalendarView.jsx
import { useState } from "react";
import EmptyState from "./EmptyState";

const PRIORITY_COLORS = { High: "bg-red-500", Medium: "bg-yellow-500", Low: "bg-green-500" };

export default function CalendarView({ tasks, events }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today.toISOString().split("T")[0]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthName = current.toLocaleString("default", { month: "long", year: "numeric" });

  const taskById = new Map(tasks.map(task => [task.id, task]));
  const eventsForDate = (dateStr) => events.filter(e => e.start.startsWith(dateStr));
  const selectedEvents = eventsForDate(selected);

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Calendar</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-600">◀</button>
            <h3 className="text-sm font-semibold text-gray-800">{monthName}</h3>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-600">▶</button>
          </div>
          <div className="grid grid-cols-7 text-xs font-medium text-center text-gray-400 mb-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayEvents = eventsForDate(dateStr);
              const isToday = dateStr === today.toISOString().split("T")[0];
              const isSelected = dateStr === selected;
              return (
                <div key={day} onClick={() => setSelected(dateStr)}
                  className={`rounded-lg p-1 min-h-10 cursor-pointer transition ${isSelected ? "bg-indigo-600 text-white" : isToday ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-gray-50 text-gray-700"}`}>
                  <div className="text-xs text-center mb-1">{day}</div>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Events for {selected}</h3>
          {selectedEvents.length === 0
            ? <EmptyState message="No events for this date" small />
            : selectedEvents.map(event => (
              <div key={event.id} className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium text-gray-800">{event.title}</p>
                <p className="text-xs text-gray-500 mt-1">{event.start.slice(11)} – {event.end.slice(11)}</p>
                <p className="text-xs text-gray-400 mt-1">{taskById.get(event.task_id)?.assignee} · {taskById.get(event.task_id)?.priority}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
```

### Task B4 — Polish & Responsiveness (3:00–3:30)
- Verify all screens look acceptable on 640px width
- Add `md:` breakpoints where grids collapse to single column
- Test empty states appear when filters eliminate all tasks

---

## Person C — AI Chat, Auth Pages, Empty States

**Estimated time: 3.5 hours**

### Task C1 — EmptyState Component (0:20–0:35)

```jsx
// src/components/EmptyState.jsx
export default function EmptyState({ message = "Nothing here yet", small = false }) {
  if (small) return (
    <div className="text-center py-6 px-3">
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">✦</div>
      <p className="text-base font-medium text-gray-500">{message}</p>
      <p className="text-sm text-gray-400 mt-1">Try adding something to get started.</p>
    </div>
  );
}
```

### Task C2 — Login Page (0:35–1:15)

```jsx
// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    // Day 2: replace with real API call
    onLogin();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">✦ Axon</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your workspace</p>
        </div>
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition mt-2">Sign In</button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Register</Link></p>
      </div>
    </div>
  );
}
```

### Task C3 — Register Page (1:15–1:50)

```jsx
// src/pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">✦ Axon</h1>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>
        <div className="flex flex-col gap-4">
          {[["Name", "name", "text", "Your full name"], ["Email", "email", "email", "you@example.com"], ["Password", "password", "password", "Min 8 characters"]].map(([label, field, type, ph]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">I am a...</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Student</option><option>Manager</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition mt-2">Create Account</button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign In</Link></p>
      </div>
    </div>
  );
}
```

### Task C4 — AI Chat Panel (1:50–3:10)

```jsx
// src/components/AIChat.jsx
import { useEffect, useState } from "react";
import { mockResponses, initialMessages } from "../data/mockChats";

const SUGGESTIONS = [
  "Generate my schedule for today",
  "Show high priority tasks",
  "What's overdue?",
  "Create a task: Review PR by tomorrow",
];

export default function AIChat({ tasks, onEventCreate, initialPrompt = "" }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("schedule")) return mockResponses.schedule;
    if (lower.includes("overdue")) return mockResponses.overdue;
    if (lower.includes("priority") || lower.includes("high")) return mockResponses.priority;
    if (lower.includes("create") || lower.includes("add")) return mockResponses.create;
    return mockResponses.default;
  };

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), user_id: 1, role: "user", text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    // Day 2: replace setTimeout with real API call to ai.js
    setTimeout(() => {
      const aiMsg = { id: Date.now() + 1, user_id: 1, role: "assistant", text: getResponse(text), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
      if (text.toLowerCase().includes("schedule") && onEventCreate && tasks.length > 0) {
        onEventCreate({
          id: Date.now() + 2,
          task_id: tasks[0].id,
          title: tasks[0].title,
          start: `${new Date().toISOString().split("T")[0]}T09:00`,
          end: `${new Date().toISOString().split("T")[0]}T10:00`,
        });
      }
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (initialPrompt) send(initialPrompt);
  }, [initialPrompt]);

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">✦ AI Assistant</h2>
        <p className="text-sm text-gray-500">Natural language task management powered by AI</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md ${m.role === "user" ? "order-2" : "order-1"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-1">✦</div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  {m.text}
                </div>
                <p className="text-xs text-gray-400 mt-1">{m.timestamp}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition">{s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask me anything about your tasks..." className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => send(input)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task C5 — Final Polish & Integration Check (3:10–3:30)
- Verify EmptyState appears on filtered-empty kanban columns
- Verify calendar day click shows empty state correctly
- Check auth pages look clean on mobile
- Add `overflow-hidden` to any layout edge cases

---

## Parallel Workflow Timeline

| Time | Person A | Person B | Person C |
|------|----------|----------|----------|
| 0:00–0:20 | Project setup, folder creation, mock data | Wait / study FilterBar + Modal specs | Wait / study AIChat specs |
| 0:20–0:40 | App.jsx routing | FilterBar.jsx | EmptyState.jsx |
| 0:40–1:00 | Sidebar.jsx | FilterBar.jsx cont. | Login.jsx |
| 1:00–1:20 | Dashboard.jsx | TaskModal.jsx | Login.jsx cont. |
| 1:20–1:50 | Dashboard.jsx cont. | TaskModal.jsx cont. | Register.jsx |
| **1:50 — CHECKPOINT 1** | Merge: Sidebar + Dashboard working | FilterBar + Modal done | EmptyState + Auth done |
| 1:50–2:20 | KanbanBoard.jsx | CalendarView.jsx | AIChat.jsx |
| 2:20–2:50 | TaskCard.jsx | CalendarView.jsx cont. | AIChat.jsx cont. |
| **2:50 — CHECKPOINT 2** | Merge: Full kanban working | Calendar working | Chat working |
| 2:50–3:20 | Integration + bug fixes | Responsiveness pass | Responsiveness pass |
| **3:20 — CHECKPOINT 3** | Final integration | Final integration | Final integration |
| 3:20–3:40 | Walkthrough rehearsal | Walkthrough rehearsal | Walkthrough rehearsal |

---

## Integration Checkpoints

### Checkpoint 1 (1:50) — Shell Integration
- Person A pulls B's FilterBar and C's EmptyState
- Verify App.jsx renders Sidebar + Dashboard without errors
- All routing links (`/`, `/board`, `/calendar`, `/ai`) must navigate correctly
- **Integration test:** Click all nav links, confirm no blank screens

### Checkpoint 2 (2:50) — Full Feature Integration
- Person A integrates KanbanBoard with Modal (from B) and EmptyState (from C)
- Confirm `onSave`, `onEdit`, `onDelete`, `onMove` callbacks fire correctly
- Person B confirms CalendarView receives `tasks` and `events` props and date click works
- Person C confirms AIChat suggestion buttons trigger responses
- **Integration test:** Create task → appears on board + calendar. Delete task → disappears. Filter by High → only High cards show.

### Checkpoint 3 (3:20) — Polish Pass
- Everyone reviews on a 768px width (judge may use a laptop)
- Check all empty states appear where expected
- Verify no console errors
- Rehearse the 5-minute walkthrough script once

---

## 5-Minute Walkthrough Script

**Speaker: Person A drives the keyboard. Person C narrates. Person B handles questions.**

---

**[0:00–0:30] — Dashboard**

> "This is Axon, our AI-powered task automation platform. The dashboard gives you an instant health check of your work — total tasks, completed, in progress, and overdue — all computed live from your task data."

*Click:* Show the 4 stat cards. Point to the Recent Activity feed.

---

**[0:30–1:30] — Kanban Board + CRUD**

> "The board gives you full task visibility across four stages. Let me create a task live."

*Click:* "+ New Task" → fill Title: "Prepare pitch deck", Priority: High, Due: [tomorrow's date], Assignee: Demo User → "Create Task"

> "The task appears immediately in To Do. Now let me move it forward."

*Click:* Change status dropdown on the card to "In Progress" — card moves column.

> "Editing and deleting work the same way."

*Click:* Edit the task, change priority to Medium → Save. Then demonstrate Delete on a different card.

---

**[1:30–2:00] — Filtering**

> "Filtering is live and end-to-end. Watch."

*Click:* Select "High" from Priority filter → only High cards remain across all columns.

> "This will be backed by a database query on Day 2 — the filter interface is already wired."

*Click:* Reset to "All Priorities".

---

**[2:00–2:45] — AI Chat**

> "This is the AI assistant. It understands natural language."

*Click:* Navigate to AI Chat. Click suggestion "Generate my schedule for today."

> "It responds with a generated daily schedule. On Day 2, this will be live-connected to our AI API with actual task context."

*Type:* "Show high priority tasks" → send.

> "It surfaces the right information conversationally. No clicking through menus."

---

**[2:45–3:30] — Calendar**

> "The calendar view plots events on their scheduled times. Colored dots indicate the linked task priority."

*Click:* Navigate to Calendar. Click a date that has events.

> "Clicking any date shows the events scheduled that day on the right. This will render live database data on Day 2."

*Click:* Click a date with no events — empty state appears.

> "We've handled empty states throughout — the app never shows a blank screen."

---

**[3:30–4:00] — Auth Pages**

> "Authentication is built and ready for Day 2. Login and register pages with validation."

*Click:* Navigate to `/login`, show the form. Navigate to `/register`, show role selector.

> "On Day 2 we wire these to our Express auth endpoints with bcrypt and JWT."

---

**[4:00–5:00] — Q&A Buffer**

Be ready to answer:
- "How will the AI actually work?" → Gemini/OpenAI API call from `/api/ai` endpoint, task context injected in system prompt
- "How is data persisted?" → PostgreSQL via Prisma ORM on Day 2, schema already designed
- "How does auth work?" → JWT tokens, bcrypt password hashing, protected routes middleware

---

## Empty States Checklist

| Location | Trigger | Message |
|----------|---------|---------|
| KanbanBoard — any column | Column has 0 tasks | "No [status] tasks" |
| KanbanBoard — after filter | Filter eliminates all | "No tasks match this filter" |
| Calendar — date panel | Selected date has no events | "No events for this date" |
| Dashboard — recent activity | tasks array is empty | "No tasks yet. Create your first one!" |
| AIChat — on load | initial state handled by initialMessages | (handled — shows greeting) |

---

## Day 2 Prep Checklist

### API Stub Files (create now, fill Day 2)
```js
// src/api/tasks.js
export const fetchTasks = async () => { /* GET /api/tasks */ };
export const createTask = async (task) => { /* POST /api/tasks */ };
export const updateTask = async (id, task) => { /* PUT /api/tasks/:id */ };
export const deleteTask = async (id) => { /* DELETE /api/tasks/:id */ };
```

```js
// src/api/auth.js
export const login = async (email, password) => { /* POST /api/auth/login */ };
export const register = async (data) => { /* POST /api/auth/register */ };
```

```js
// src/api/ai.js
export const chatWithAI = async (message, taskContext) => { /* POST /api/ai/chat */ };
export const generateSchedule = async (tasks) => { /* POST /api/ai/schedule */ };
```

### Files to Replace on Day 2
| File | Action |
|------|--------|
| `src/data/mockTasks.js` | Replace `mockTasks` initial value with `await fetchTasks()` in App.jsx |
| `src/data/mockChats.js` | Replace mock responses with real `chatWithAI()` call in AIChat.jsx |
| `src/pages/Login.jsx` | Wire `handleSubmit` to `login()` from api/auth.js |
| `App.jsx` → `isLoggedIn` | Replace with JWT token check from localStorage |

### Expected Day 2 API Endpoints
```
POST   /api/auth/register    { name, email, password, role }
POST   /api/auth/login       { email, password } → { token, user }
GET    /api/tasks             → Task[]
POST   /api/tasks             { title, description, priority, status, due, assignee }
PUT    /api/tasks/:id         Partial<Task>
DELETE /api/tasks/:id         → { success: true }
POST   /api/ai/chat           { message, context: Task[] } → { reply: string }
POST   /api/ai/schedule       { tasks: Task[] } → { schedule: string }
```

---

## Common Failure Modes

| # | Failure | Solution |
|---|---------|----------|
| 1 | **Filtering breaks** because filter logic is inside FilterBar instead of parent | Keep all filter logic in KanbanBoard.jsx using useState; FilterBar only calls `onFilterChange` |
| 2 | **Modal doesn't populate** when editing because `useEffect` dependency is missing | Always include `task` in useEffect deps: `useEffect(() => { if (task) setForm(task) }, [task])` |
| 3 | **Calendar shows wrong dates** due to timezone offset in `new Date()` | Always parse dates as `new Date(year, month, day)` or compare as strings, never `new Date(dateStr)` directly |
| 4 | **Stats cards show 0** because computed values use wrong field names | Double-check field names match mockTasks.js exactly: `status`, `priority`, `due` |
| 5 | **Task disappears after edit** because spread operator mutates instead of replacing | In `handleSave`: `setTasks(prev => prev.map(t => t.id === task.id ? { ...task } : t))` |
| 6 | **Mobile layout breaks** on narrow screens | Add `overflow-x-hidden` to the outer layout div and `min-w-0` to flex children |
| 7 | **Empty states not shown** because component renders `null` instead of `<EmptyState />` | Every conditional render for 0-length arrays must return `<EmptyState />`, not `null` or `""` |

---

## Critical Success Factors

- All three people must be coding within 20 minutes of arrival — no time for setup debates
- Person A's App.jsx is the integration hub — everyone else's components plug into it via props
- Every component that receives data must receive it as a prop, never import mockTasks directly
- The `src/api/` stub files signal to judges that Day 2 wiring is planned and understood
- Empty states must exist in every list view — judges specifically look for this
- The AI Chat suggestion buttons must visibly work during the demo — pre-test all 4 keywords
- Practice the 5-minute walkthrough at least once before submission — 5 minutes is shorter than it feels
- At Checkpoint 2, if anything is broken, prioritize Kanban + Dashboard over Calendar — they carry more weight