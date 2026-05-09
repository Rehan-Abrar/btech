// src/components/KanbanBoard.jsx
// AXON Brand redesign — "Intelligent Terminal" feel.
// - Pill-shaped filter bar and New Task button (gold CTA)
// - Sentence case everywhere, no all-caps
// - Column headers use JetBrains Mono for counts
// - 0.5px Steel Rim column borders
// - Filter logic stays here (plan.md failure mode #1)

import { useState } from "react";
import TaskCard   from "./TaskCard";
import FilterBar  from "./FilterBar";
import EmptyState from "./EmptyState";

const COLUMNS = ["To Do", "In Progress", "Review", "Done"];

// Column config — strict AXON palette
const COL_CONFIG = {
  "To Do":       { dot: "#5A6380", accent: "#5A6380" },
  "In Progress": { dot: "#D4AF37", accent: "#D4AF37" },
  "Review":      { dot: "#87CEEB", accent: "#87CEEB" },
  "Done":        { dot: "#22C55E", accent: "#22C55E" },
};

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
);

export default function KanbanBoard({ tasks, onAdd, onEdit, onDelete, onMove }) {
  const [filters, setFilters] = useState({ priority: "All" });

  // Filter logic lives here — never in FilterBar
  const filtered = tasks.filter(t =>
    filters.priority === "All" || t.priority === filters.priority
  );

  const visibleCount = filtered.length;
  const totalCount   = tasks.length;

  return (
    <div className="p-6 fade-in">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-medium text-white">Task board</h1>
          <p className="font-mono text-iron mt-1" style={{ fontSize: "11px" }}>
            {visibleCount === totalCount
              ? `${totalCount} task${totalCount !== 1 ? "s" : ""}`
              : `${visibleCount} of ${totalCount} tasks`}
          </p>
        </div>

        {/* Gold pill CTA — matches brand primary button spec */}
        <button
          id="kanban-new-task-btn"
          onClick={onAdd}
          className="
            flex items-center gap-2
            bg-gold text-navy font-medium text-sm
            rounded-pill py-2 px-5 shrink-0
            hover:brightness-110 active:scale-95
            transition-all duration-150
          "
        >
          <PlusIcon />
          New task
        </button>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <FilterBar onFilterChange={setFilters} />

      {/* ── Kanban grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col);
          const cfg      = COL_CONFIG[col];
          const allPct   = totalCount > 0
            ? Math.round((colTasks.length / totalCount) * 100)
            : 0;

          return (
            <div
              key={col}
              className="flex flex-col rounded-2xl overflow-hidden backdrop-blur-md"
              style={{
                background: "rgba(10,38,71,0.45)",
                border: "0.5px solid #1E3A5F",
                minHeight: "28rem",
              }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "0.5px solid #1E3A5F" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: cfg.dot }}
                  />
                  {/* Sentence case column label */}
                  <h2
                    className="text-sm font-medium"
                    style={{ color: col === "In Progress" ? "#D4AF37" : "#FFFFFF" }}
                  >
                    {col}
                  </h2>
                </div>

                {/* Count badge — JetBrains Mono */}
                <span
                  className="font-mono text-iron rounded-lg px-1.5 py-0.5"
                  style={{
                    fontSize: "11px",
                    background: `${cfg.dot}18`,
                    border: `0.5px solid ${cfg.dot}33`,
                    color: cfg.dot,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Thin progress bar — gold for active, colour-matched otherwise */}
              <div className="h-px bg-steel/40 mx-4 mt-0">
                <div
                  className="h-px col-bar"
                  style={{
                    width: `${allPct}%`,
                    background: cfg.dot,
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
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