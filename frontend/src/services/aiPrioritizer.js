// src/services/aiPrioritizer.js
// Rule-based prioritization + scoring helpers.
// Day 2: swap internals with backend/LLM, keep function signature stable.

const PRIORITY_RANK = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function clampPriority(p) {
  if (!p) return "Medium";
  if (p === "urgent") return "Urgent";
  if (p === "high") return "High";
  if (p === "medium") return "Medium";
  if (p === "low") return "Low";
  return p;
}

export function calculateScore(task) {
  // Higher score = should appear higher.
  let score = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = task?.due ? new Date(task.due) : null;
  if (dueDate && !Number.isNaN(dueDate.getTime())) {
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) score += 40;
    if (diffDays < 0) score += 60;
  }

  const p = clampPriority(task?.priority);
  if (p === "Urgent") score += 50;
  if (p === "High") score += 30;
  if (p === "Medium") score += 10;

  if (task?.status === "In Progress") score += 20;
  if (task?.status === "Done") score -= 100;

  return score;
}

export function prioritizeTasks(tasks, incomingTask = null) {
  const updatedTasks = tasks.map(t => ({ ...t }));
  const incoming = incomingTask ? { ...incomingTask } : null;

  const incomingPriority = incoming ? clampPriority(incoming.priority) : null;
  const urgentIncoming = incoming ? (incomingPriority === "Urgent" || incomingPriority === "High") : false;

  let changedCount = 0;

  // Simple rule pass: if urgent/high task arrives, de-escalate some medium tasks.
  if (urgentIncoming) {
    for (let i = 0; i < updatedTasks.length; i += 1) {
      const t = updatedTasks[i];
      if (t.status === "Done") continue;

      if (t.priority === "Medium") {
        updatedTasks[i] = {
          ...t,
          priority: "Low",
          aiReason: "Deprioritized to create capacity for a high-urgency task.",
        };
        changedCount += 1;
      }
    }

    incoming.aiReason = "High-urgency intake triggered system-wide re-prioritization.";
  }

  // Score pass (makes it feel smarter and produces deterministic ordering)
  const scored = updatedTasks.map(t => ({ ...t, aiScore: calculateScore(t) }));
  const incomingScored = incoming ? { ...incoming, aiScore: calculateScore(incoming) + (urgentIncoming ? 10 : 0) } : null;

  // Sort by score, then by priority rank, then by due date.
  scored.sort((a, b) => {
    if ((b.aiScore ?? 0) !== (a.aiScore ?? 0)) return (b.aiScore ?? 0) - (a.aiScore ?? 0);
    const pr = (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0);
    if (pr !== 0) return pr;
    return String(a.due ?? "").localeCompare(String(b.due ?? ""));
  });

  return {
    tasks: scored,
    incomingTask: incomingScored,
    summary: {
      changedCount,
      changed: urgentIncoming,
      message: urgentIncoming
        ? `⚡ AI reprioritized ${changedCount} task${changedCount === 1 ? "" : "s"} to make room for urgent work.`
        : "AI scoring updated task ordering.",
    },
  };
}
