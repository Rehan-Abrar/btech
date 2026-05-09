# Bonus Features — Leaderboard Boosters

Optional features awarded in order of submission. Each item is scored separately and can be implemented incrementally. This document describes each booster, suggested implementation approach, estimated complexity, and integration notes to help prioritize work.

## Overview
These features are extras beyond the Day 1 scope. They provide competitive grading points for demos and judges. Implement any subset; each feature is independently scored.

---

## Scoreboard (summary)
- AI agent that reorganizes priorities on high-urgency task — **+12 pts**
- Real-time collaboration (WebSocket) — **+10 pts**
- Voice input on chat (Web Speech API) — **+8 pts**
- Recurring task automation — **+8 pts**
- Productivity analytics page — **+6 pts**
- Browser push notifications for deadlines — **+6 pts**

---

## 1) AI priority reorg (12 pts)
Purpose
- An autonomous agent scans all tasks and reprioritizes them when a new high-urgency task appears, ensuring the most important work surfaces to the top.

Behavior
- Trigger: creation of a task with `priority: High` (or a manual "Re-evaluate priorities" action).
- Action: compute a recommended priority ordering using simple heuristics (due date proximity, overdue flag, existing priority, assignee load) and apply changes optionally with confirmation.

Implementation notes
- Day 2: run on server via scheduled job / worker. Day 1 demo: run on client when task list updates.
- Algorithm: weighted score = w1*(isOverdue) + w2*(1/daysToDue) + w3*(priorityWeight) + w4*(assigneeLoad).
- UI: show a compact changelog and an undo button for safety.

Complexity: Medium–High (12 pts awarded)

---

## 2) Real-time collaboration (10 pts)
Purpose
- Multiple users see board updates instantly via WebSocket (live adds/edits/moves), enabling collaborative sessions.

Behavior
- Connect clients to a lightweight WebSocket server; broadcast task CRUD and move events.
- Implement optimistic UI and reconciliation to avoid flicker.

Implementation notes
- Use a simple Node.js WebSocket server (ws) or Socket.io for demo. Server echoes events to all connected clients.
- Day 1 demo: run locally, or use a hosted dev server (Heroku/Render) for multi-device testing.
- Add presence indicators and last-updated metadata on tasks for clarity.

Complexity: Medium (10 pts awarded)

---

## 3) Voice input in AI chat (8 pts)
Purpose
- Allow users to speak commands or prompts in the chat using the Web Speech API, improving accessibility and speed.

Behavior
- Press-and-hold or toggle microphone in the AI chat input; transcribe speech to text, paste into input, and optionally auto-send.

Implementation notes
- Use the browser `SpeechRecognition` API (window.SpeechRecognition || webkitSpeechRecognition). Provide graceful fallback when unavailable.
- Indicate live listening with pulsing gold cursor/indicator per brand rules.
- Security: only client-side; no audio upload required for demo.

Complexity: Low–Medium (8 pts awarded)

---

## 4) Recurring task automation (8 pts)
Purpose
- Let users define simple recurring rules (daily, weekly, monthly) so the system auto-generates tasks on schedule.

Behavior
- UI: from Task Modal, add "Repeat" with frequency, start date, end/occurrences.
- Generation: client-side cron-like scheduler for demo; server-side cron or worker for production.

Implementation notes
- Store recurrence rules with a task (e.g., RRULE-lite). On each app load or midnight tick, generate instances up to a horizon (30 days).
- Avoid duplicate generation via an ID linking generated instances to the rule.

Complexity: Medium (8 pts awarded)

---

## 5) Productivity analytics page (6 pts)
Purpose
- Provide charts and KPIs: completion rate, avg time-to-complete, tasks per day, streaks.

Behavior
- A new route `/analytics` shows visualizations (small charts), targets, and trends.

Implementation notes
- For Day 1, compute metrics from `mockTasks` in the client and render SVG sparklines / bar charts.
- Use lightweight charting (pure SVG, no external libs) to stay within project constraints.

Complexity: Low–Medium (6 pts awarded)

---

## 6) Browser push notifications (6 pts)
Purpose
- Notify users of upcoming deadlines via the browser Notifications API and optional service worker for push.

Behavior
- Request `Notification` permission. Schedule local notifications for tasks due within the next X hours.
- For real push (optional): integrate a push service and a server component to send pushes.

Implementation notes
- Day 1 demo: use the Notifications API on the client and `setTimeout`/`setInterval` to simulate scheduling.
- For production: use service workers and a push subscription (VAPID) paired with a server to send real pushes.

Complexity: Medium (6 pts awarded)

---

## Prioritization Guidance
- If you need to pick 2 features for a short demo, pick Real-time collaboration (+10) and AI priority reorg (+12) — they demonstrate multi-user dynamics and core intelligence.
- For accessibility-focused demos, pair Voice input (+8) and Browser notifications (+6).

## Notes
- Each feature should include an "undo" or safety confirmation when making bulk changes (AI reorg, auto-generation).
- Keep all UI changes consistent with AXON brand: dark-first, gold accents for AI, rounded pill controls.

---

Document created on: 2026-05-09
