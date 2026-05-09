// src/data/mockChats.js
// Day 2: replace getResponse() in AIChat.jsx with chatWithAI() from api/ai.js

export const mockResponses = {
  default:
    "I've analyzed your tasks. You have 3 high-priority items due this week. Want me to generate a schedule?",
  schedule:
    "Here's your optimized schedule for today:\n• 9:00 AM – Fix authentication bug (High)\n• 11:00 AM – Design landing page mockups\n• 2:00 PM – Implement task filtering\n• 4:00 PM – Review PR for DB schema",
  overdue:
    "You have 1 overdue task: 'Fix authentication bug' was due June 8th. It's now marked Done — great work!",
  priority:
    "Your top 3 high-priority tasks:\n1. Design landing page mockups (Due Jun 10)\n2. Fix authentication bug (Done)\n3. Deploy staging environment (Due Jun 15)",
  create:
    "Task created successfully! I've added it to your To Do column and scheduled a reminder for the due date.",
};

export const initialMessages = [
  {
    id: 1,
    user_id: 1,
    role: "assistant",
    text: "Hi there! I'm your AI assistant. I can help you manage tasks, generate schedules, and automate workflows. Try asking me something!",
    timestamp: "09:00 AM",
  },
];