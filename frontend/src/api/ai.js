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

export const getChatHistory = async () => {
  const res = await fetch(`${BASE}/api/ai/history`, {
    method: "GET",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch chat history");
  return res.json();
};