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
  if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`);
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
  if (!res.ok) throw new Error(`Failed to create task (${res.status})`);
  return res.json();
};

export const updateTask = async (id, task) => {
  const body = { ...task };
  if (task.priority) body.priority = PRIORITY_TO_DB[task.priority] || task.priority?.toLowerCase();
  if (task.status)   body.status   = STATUS_TO_DB[task.status]   || task.status?.toLowerCase().replace(" ", "-");
  const res = await fetch(`${BASE}/api/tasks/${id}`, {
    method: "PUT", headers: authHeader(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE}/api/tasks/${id}`, {
    method: "DELETE", headers: authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to delete task (${res.status})`);
  return res.json();
};

export const fetchSummary = async () => {
  const res = await fetch(`${BASE}/api/tasks/summary`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
};

export const fetchCalendar = async (start, end) => {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end)   params.append("end", end);
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