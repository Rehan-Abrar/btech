// src/components/CalendarView.jsx
// Person B owns this component — production stub for Person A integration.
// Prop contract: tasks={Task[]}, events={Event[]}

import { useState } from "react";
import EmptyState from "./EmptyState";

const PRIORITY_DOT = {
  High:   "#FF4D4D",
  Medium: "#F5A623",
  Low:    "#22C55E",
};

const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const ChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
);

export default function CalendarView({ tasks, events }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [current,  setCurrent]  = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayStr);

  const year       = current.getFullYear();
  const month      = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay   = new Date(year, month, 1).getDay();
  const monthName  = current.toLocaleString("default", { month: "long", year: "numeric" });

  const pad = n => String(n).padStart(2, "0");

  const eventsForDate = (dateStr) => events.filter(e => e.start.startsWith(dateStr));
  const taskById = new Map(tasks.map(t => [t.id, t]));
  const selectedEvents = eventsForDate(selected);

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      <h1 className="text-2xl font-semibold text-white mb-6">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Month grid */}
        <div className="lg:col-span-2 bg-navy rounded-2xl border border-steel p-5">
          {/* Nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-lg bg-steel text-skyblue hover:text-gold hover:border-gold border border-steel/0 flex items-center justify-center transition-all"
            >
              <ChevLeft />
            </button>
            <h2 className="text-sm font-semibold text-white">{monthName}</h2>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-lg bg-steel text-skyblue hover:text-gold flex items-center justify-center transition-all"
            >
              <ChevRight />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-xs font-medium text-center text-iron mb-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day    = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayEvts = eventsForDate(dateStr);
              const isToday    = dateStr === todayStr;
              const isSelected = dateStr === selected;

              return (
                <div
                  key={day}
                  id={`cal-day-${dateStr}`}
                  onClick={() => setSelected(dateStr)}
                  className={`
                    rounded-lg p-1 min-h-10 cursor-pointer transition-all duration-150
                    flex flex-col items-center
                    ${isSelected
                      ? "bg-gold text-navy"
                      : isToday
                        ? "bg-steel border border-gold/40 text-gold font-semibold"
                        : "hover:bg-steel text-skyblue"}
                  `}
                >
                  <span className="text-xs mb-0.5">{day}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvts.slice(0, 3).map(ev => {
                      const linked = taskById.get(ev.task_id);
                      return (
                        <span
                          key={ev.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: linked ? PRIORITY_DOT[linked.priority] : "#D4AF37" }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events panel */}
        <div className="bg-navy rounded-2xl border border-steel p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Events</h3>
          <p className="text-xs text-iron font-mono mb-4">{selected}</p>

          {selectedEvents.length === 0
            ? <EmptyState message="No events for this date" small />
            : selectedEvents.map(ev => {
                const linked = taskById.get(ev.task_id);
                return (
                  <div key={ev.id} className="mb-3 p-3 rounded-xl bg-steel/40 border border-steel card-hover">
                    <div className="flex items-center gap-2 mb-1">
                      {linked && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: PRIORITY_DOT[linked?.priority] ?? "#D4AF37" }}
                        />
                      )}
                      <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                    </div>
                    <p className="text-xs font-mono text-skyblue">
                      {ev.start.slice(11)} – {ev.end.slice(11)}
                    </p>
                    {linked && (
                      <p className="text-xs text-iron mt-1">
                        {linked.assignee} · {linked.priority}
                      </p>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}