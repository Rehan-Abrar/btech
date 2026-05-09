// src/components/CalendarView.jsx
// Person B owns this component — production stub for Person A integration.
// Prop contract: tasks={Task[]}, events={Event[]}

import { useMemo, useState } from "react";
import EmptyState from "./EmptyState";

const COLORS = {
  navyBlue: "#0A2647",
  mustardGold: "#D4AF37",
  pureWhite: "#FFFFFF",
  richBlack: "#1A1A1A",
  skyBlue: "#87CEEB",
  steelRim: "#1E3A5F",
  alertRed: "#FF4D4D",
  cautionAmber: "#F5A623",
  taskGreen: "#22C55E",
  ironGray: "#5A6380",
};

const STATUS_COLOR = {
  Done: COLORS.taskGreen,
  Review: COLORS.cautionAmber,
  "In Progress": COLORS.mustardGold,
  "To Do": COLORS.skyBlue,
};

const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
);

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function CalendarView({ tasks = [], events = [], onAdd, onEdit }) {
  const todayStr = toDateStr(new Date());

  const [current, setCurrent] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayStr);

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = current.toLocaleString("default", { month: "long", year: "numeric" });

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const dateStr = typeof e.start === "string" ? e.start.slice(0, 10) : "";
      if (!dateStr) continue;
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr).push(e);
    }

    // stable ordering: start time then title
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => {
        const as = String(a.start ?? "");
        const bs = String(b.start ?? "");
        if (as < bs) return -1;
        if (as > bs) return 1;
        return String(a.title ?? "").localeCompare(String(b.title ?? ""));
      });
      map.set(k, list);
    }

    // Also inject any tasks that don't have an explicit event associated with them!
    const taskIdsWithEvents = new Set(events.map(e => e.task_id));
    for (const t of tasks) {
      if (!taskIdsWithEvents.has(t.id) && t.due) {
        const dateStr = t.due;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr).push({
          id: `task-${t.id}`,
          task_id: t.id,
          title: t.title,
          start: `${t.due}T00:00`,
          end: `${t.due}T23:59`,
          isPseudoEvent: true
        });
      }
    }

    return map;
  }, [events, tasks]);

  const selectedEvents = eventsByDate.get(selected) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: COLORS.pureWhite }}>Calendar</h1>
          <p className="text-sm" style={{ color: COLORS.skyBlue }}>
            Month view. Select a date to review scheduled work.
          </p>
        </div>
        {onAdd && (
          <button
            id="calendar-new-task-btn"
            onClick={onAdd}
            className="flex items-center gap-2 bg-gold text-navy font-medium text-sm
                       rounded-pill py-2.5 px-5
                       hover:brightness-110 active:scale-95 transition-all"
            style={{ backgroundColor: COLORS.mustardGold, color: COLORS.navyBlue, borderRadius: "9999px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Month grid */}
        <section className="lg:col-span-2 rounded-2xl border p-5 backdrop-blur-md" style={{ backgroundColor: "rgba(10,38,71,0.45)", borderColor: COLORS.steelRim }}>
          {/* Header / nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="w-9 h-9 rounded-full flex items-center justify-center transition"
              style={{ backgroundColor: "rgba(30,58,95,0.35)", color: COLORS.skyBlue, border: `1px solid ${COLORS.steelRim}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.mustardGold; e.currentTarget.style.color = COLORS.mustardGold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.steelRim; e.currentTarget.style.color = COLORS.skyBlue; }}
              aria-label="Previous month"
            >
              <ChevLeft />
            </button>

            <h2 className="text-sm font-medium" style={{ color: COLORS.pureWhite }}>{monthName}</h2>

            <button
              type="button"
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="w-9 h-9 rounded-full flex items-center justify-center transition"
              style={{ backgroundColor: "rgba(30,58,95,0.35)", color: COLORS.skyBlue, border: `1px solid ${COLORS.steelRim}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.mustardGold; e.currentTarget.style.color = COLORS.mustardGold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.steelRim; e.currentTarget.style.color = COLORS.skyBlue; }}
              aria-label="Next month"
            >
              <ChevRight />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-xs text-center mb-2" style={{ color: COLORS.ironGray }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[88px]" />
            ))}

            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayEvents = eventsByDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selected;

              const baseBorder = isSelected
                ? COLORS.mustardGold
                : isToday
                  ? "rgba(212,175,55,0.55)"
                  : COLORS.steelRim;

              const bg = isSelected
                ? "rgba(212,175,55,0.10)"
                : "rgba(26,26,26,0.30)";

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelected(dateStr)}
                  className="text-left rounded-2xl border p-2 min-h-[88px] transition"
                  style={{ backgroundColor: bg, borderColor: baseBorder }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: isToday ? COLORS.mustardGold : COLORS.pureWhite }}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[11px] font-mono" style={{ color: COLORS.skyBlue }}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Compact task chips (max 2) */}
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const linked = taskById.get(ev.task_id);
                      const chipColor = linked?.status ? (STATUS_COLOR[linked.status] ?? COLORS.mustardGold) : COLORS.mustardGold;
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-2 rounded-full px-2 py-1 border"
                          style={{ borderColor: "rgba(30,58,95,0.8)", backgroundColor: "rgba(10,38,71,0.75)" }}
                          title={ev.title}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chipColor }} />
                          <span className="text-[11px] truncate" style={{ color: COLORS.skyBlue }}>
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[11px]" style={{ color: COLORS.ironGray }}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Side panel (selected day) */}
        <aside className="rounded-2xl border p-5 backdrop-blur-md" style={{ backgroundColor: "rgba(10,38,71,0.45)", borderColor: COLORS.steelRim }}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-medium" style={{ color: COLORS.pureWhite }}>Scheduled</h3>
              <p className="text-xs font-mono mt-1" style={{ color: COLORS.ironGray }}>{selected}</p>
            </div>
            {selected === todayStr && (
              <span className="text-[11px] rounded-full px-3 py-1 border" style={{ color: COLORS.mustardGold, borderColor: "rgba(212,175,55,0.55)" }}>
                Today
              </span>
            )}
          </div>

          {selectedEvents.length === 0 ? (
            <EmptyState message="No tasks scheduled on this date" small />
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev) => {
                const linked = taskById.get(ev.task_id);
                const statusColor = linked?.status ? (STATUS_COLOR[linked.status] ?? COLORS.mustardGold) : COLORS.mustardGold;
                return (
                  <div
                    key={ev.id}
                    onClick={() => linked && onEdit && onEdit(linked)}
                    className={`rounded-2xl border p-4 ${linked ? "cursor-pointer hover:bg-white/10 transition-colors" : ""}`}
                    style={{ borderColor: COLORS.steelRim, backgroundColor: "rgba(26,26,26,0.30)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                      <p className="text-sm font-medium truncate" style={{ color: COLORS.pureWhite }}>
                        {ev.title}
                      </p>
                    </div>

                    {!ev.isPseudoEvent && (
                      <p className="text-xs font-mono mt-2" style={{ color: COLORS.skyBlue }}>
                        {String(ev.start).slice(11)} – {String(ev.end).slice(11)}
                      </p>
                    )}

                    {linked && (
                      <p className="text-xs mt-2" style={{ color: COLORS.ironGray }}>
                        {linked.assignee} · {linked.status} · {linked.priority}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}