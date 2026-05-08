// src/components/KanbanBoard.jsx
// Person A — 4-column kanban (To Do | In Progress | Review | Done).
// Filter logic lives here (not in FilterBar). FilterBar only emits change events.

import { useState } from "react";
import TaskCard  from "./TaskCard";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";

const COLUMNS = ["To Do", "In Progress", "Review", "Done"];

// Column visual config — AXON brand colours
const COL_CONFIG = {
  "To Do":       { accent: "#5A6380", label: "To Do",        dot: "#5A6380" },
  "In Progress": { accent: "#D4AF37", label: "In Progress",  dot: "#D4AF37" },
  "Review":      { accent: "#87CEEB", label: "Review",       dot: "#87CEEB" },
  "Done":        { accent: "#22C55E", label: "Done",         dot: "#22C55E" },
};

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function KanbanBoard({ tasks, onAdd, onEdit, onDelete, onMove }) {
  const [filters, setFilters] = useState({ priority: "All", status: "All" });

  // Filter logic stays in parent — plan failure mode #1
  const filtered = tasks.filter(t =>
    (filters.priority === "All" || t.priority === filters.priority)
  );

  const total    = tasks.length;
  const filtered_count = filtered.length;

  return (
    <div className="p-6 fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Task Board</h1>
          <p className="text-skyblue text-sm mt-1">
            {filtered_count === total
              ? `${total} task${total !== 1 ? "s" : ""} total`
              : `${filtered_count} of ${total} tasks`}
          </p>
        </div>
        <button
          id="kanban-new-task-btn"
          onClick={onAdd}
          className="flex items-center gap-2 bg-gold text-navy font-medium text-sm
                     rounded-pill py-2.5 px-5
                     hover:brightness-110 active:scale-95 transition-all"
        >
          <PlusIcon />
          New Task
        </button>
      </div>

      {/* ── Filter bar (from Person B — stub-safe) ────────── */}
      <FilterBar onFilterChange={setFilters} />

      {/* ── Kanban columns ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col);
          const cfg      = COL_CONFIG[col];

          return (
            <div
              key={col}
              className="bg-navy rounded-2xl border border-steel flex flex-col min-h-64"
              style={{ minHeight: "24rem" }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-steel">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: cfg.dot }}
                  />
                  <h3
                    className="text-sm font-medium"
                    style={{ color: cfg.accent }}
                  >
                    {cfg.label}
                  </h3>
                </div>
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg"
                  style={{
                    background: `${cfg.dot}18`,
                    color: cfg.dot,
                    border: `1px solid ${cfg.dot}33`,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Column progress bar */}
              <div className="h-0.5 bg-steel mx-4 rounded-pill overflow-hidden">
                <div
                  className="h-full rounded-pill col-bar"
                  style={{
                    width: `${total > 0 ? (colTasks.length / total) * 100 : 0}%`,
                    background: cfg.dot,
                  }}
                />
              </div>

              {/* Task cards */}
              <div className="p-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <EmptyState
                    message={
                      filters.priority !== "All"
                        ? `No ${filters.priority.toLowerCase()} priority tasks`
                        : `No ${col.toLowerCase()} tasks`
                    }
                    small
                  />
                ) : (
                  colTasks.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMove={onMove}
                      allStatuses={COLUMNS}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}