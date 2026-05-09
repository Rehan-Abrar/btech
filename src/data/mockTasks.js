// src/data/mockTasks.js
// Single source of truth for all mock data used across the app.
// Day 2: replace mockTasks with await fetchTasks() in App.jsx

export const PRIORITIES = ["High", "Medium", "Low"];
export const STATUSES   = ["To Do", "In Progress", "Review", "Done"];

export const mockTasks = [
  {
    id: 1,
    title: "Design landing page mockups",
    description: "Create wireframes for homepage and about page.",
    priority: "High",
    status: "In Progress",
    due: "2025-06-10",
    assignee: "Alex",
    tags: ["Design", "UI"],
  },
  {
    id: 2,
    title: "Write REST API documentation",
    description: "Document all endpoints with request/response examples.",
    priority: "Medium",
    status: "To Do",
    due: "2025-06-14",
    assignee: "Sam",
    tags: ["Docs"],
  },
  {
    id: 3,
    title: "Fix authentication bug",
    description: "JWT token not refreshing on session expiry.",
    priority: "High",
    status: "Done",
    due: "2025-06-08",
    assignee: "Jordan",
    tags: ["Bug", "Auth"],
  },
  {
    id: 4,
    title: "Setup PostgreSQL schema",
    description: "Define tables for users, tasks, and audit logs.",
    priority: "Low",
    status: "Review",
    due: "2025-06-12",
    assignee: "Alex",
    tags: ["Database"],
  },
  {
    id: 5,
    title: "Implement task filtering",
    description: "Add priority and status filters to kanban view.",
    priority: "Medium",
    status: "In Progress",
    due: "2025-06-11",
    assignee: "Sam",
    tags: ["Feature"],
  },
  {
    id: 6,
    title: "Deploy staging environment",
    description: "Configure Docker Compose for staging.",
    priority: "High",
    status: "To Do",
    due: "2025-06-15",
    assignee: "Jordan",
    tags: ["DevOps"],
  },
  {
    id: 7,
    title: "Write unit tests for task service",
    description: "Cover CRUD operations with Vitest.",
    priority: "Low",
    status: "To Do",
    due: "2025-06-16",
    assignee: "Alex",
    tags: ["Testing"],
  },
  {
    id: 8,
    title: "Create onboarding flow",
    description: "Step-by-step guide for new users.",
    priority: "Medium",
    status: "Done",
    due: "2025-06-07",
    assignee: "Sam",
    tags: ["UX"],
  },
];

export const mockEvents = [
  {
    id: 1,
    task_id: 1,
    title: "Design landing page mockups",
    start: "2025-06-10T09:00",
    end:   "2025-06-10T11:00",
  },
  {
    id: 2,
    task_id: 3,
    title: "Fix authentication bug",
    start: "2025-06-08T14:00",
    end:   "2025-06-08T15:30",
  },
  {
    id: 3,
    task_id: 5,
    title: "Implement task filtering",
    start: "2025-06-11T10:00",
    end:   "2025-06-11T12:00",
  },
  {
    id: 4,
    task_id: 6,
    title: "Deploy staging environment",
    start: "2025-06-15T13:00",
    end:   "2025-06-15T15:00",
  },
];

export const mockUser = {
  id:     1,
  name:   "Demo User",
  email:  "demo@axon.app",
  role:   "Manager",  // "Student" | "Manager"
  avatar: "DU",
};