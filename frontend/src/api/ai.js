// src/api/ai.js
// Day 2: replace getResponse() mock in AIChat.jsx with chatWithAI().
// Task context is injected into the system prompt on the backend.

export const chatWithAI = async (message, taskContext) => {
  // Day 2: return await fetch("/api/ai/chat", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ message, context: taskContext }),
  // }).then(r => r.json()); // → { reply: string }
};

export const generateSchedule = async (tasks) => {
  // Day 2: return await fetch("/api/ai/schedule", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ tasks }),
  // }).then(r => r.json()); // → { schedule: string }
};