// src/services/recurringTaskEngine.js
// Generates the *next* occurrence for any recurring task template.
// Strategy: create only one future instance per template to avoid clutter.

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const addMonths = (d, n) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

function safeUUID(fallbackPrefix = "gen") {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `${fallbackPrefix}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function computeNextDue(task, referenceDue) {
  const rule = (task.recurrenceRule || "weekly").toLowerCase();
  const interval = Math.max(1, Number(task.recurrenceInterval || 1));

  if (rule === "daily") {
    return addDays(referenceDue, interval);
  }

  if (rule === "monthly") {
    return addMonths(referenceDue, interval);
  }

  // weekly (default)
  const days = Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [];
  if (days.length === 0) {
    return addDays(referenceDue, 7 * interval);
  }

  // Find next matching weekday (look ahead up to 21 days)
  for (let i = 1; i <= 21; i++) {
    const cand = addDays(referenceDue, i);
    const name = DAY_NAMES[cand.getDay()];
    if (days.includes(name)) return cand;
  }

  return addDays(referenceDue, 7 * interval);
}

function latestInstanceDue(tasks, templateId) {
  const relevant = tasks.filter(
    (t) => t.id === templateId || t.parentRecurringId === templateId
  );
  const dues = relevant
    .map((t) => t.due)
    .filter(Boolean)
    .map((s) => startOfDay(new Date(`${s}T00:00`)));

  if (dues.length === 0) return null;
  dues.sort((a, b) => b.getTime() - a.getTime());
  return dues[0];
}

/**
 * @param {Array<any>} tasks
 * @returns {Array<any>} updated tasks list
 */
export function generateRecurringTasks(tasks = []) {
  const base = Array.isArray(tasks) ? tasks : [];
  const today = startOfDay(new Date());

  const created = [];

  for (const t of base) {
    if (!t?.recurring) continue;
    if (t?.generated) continue; // templates only
    if (!t?.due) continue;

    const lastDue = latestInstanceDue(base, t.id) ?? startOfDay(new Date(`${t.due}T00:00`));

    let next = computeNextDue(t, lastDue);
    while (startOfDay(next) < today) {
      next = computeNextDue(t, next);
    }

    // stop at recurrenceEnd
    if (t.recurrenceEnd) {
      const end = startOfDay(new Date(`${t.recurrenceEnd}T00:00`));
      if (startOfDay(next) > end) continue;
    }

    const nextStr = toDateStr(next);

    const alreadyExists = base.some(
      (x) => x.parentRecurringId === t.id && x.due === nextStr
    );
    if (alreadyExists) continue;

    created.push({
      ...t,
      id: safeUUID("rec"),
      due: nextStr,
      status: "To Do",
      parentRecurringId: t.id,
      generated: true,
      // AI awareness metadata
      aiReason: "Auto-generated from recurrence rule",
      aiTouched: true,
    });
  }

  return created.length ? [...base, ...created] : base;
}
