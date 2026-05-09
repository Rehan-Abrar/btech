// src/components/TaskCard.jsx
// AXON Brand — "Intelligent Terminal" feel.
// Cards: 16px radius, 0.5px Steel Rim border, gold border on hover.
// Actions hidden until hover (three-dot menu). No clutter on card face.
// JetBrains Mono for all metadata. Sentence case everywhere.

import { useState, useRef, useEffect } from "react";

const PRIORITY_CONFIG = {
  High:   { dot: "#FF4D4D", text: "text-alert",   label: "High"   },
  Medium: { dot: "#F5A623", text: "text-amber",   label: "Medium" },
  Low:    { dot: "#22C55E", text: "text-success", label: "Low"    },
};

// Three-dot menu icon
const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5"  cy="12" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="19" cy="12" r="2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const CalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// Click-outside hook for the dropdown menu
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function TaskCard({ task, onEdit, onDelete, onMove, allStatuses }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [moveOpen,  setMoveOpen]  = useState(false);
  const menuRef = useRef(null);
  const moveRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));
  useClickOutside(moveRef, () => setMoveOpen(false));

  const today     = new Date().toISOString().split("T")[0];
  const isOverdue = task.due < today && task.status !== "Done";
  const isDone    = task.status === "Done";
  const cfg       = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Low;

  return (
    <div
      className="
        group relative
        bg-navy rounded-2xl mb-2.5
        transition-all duration-200 ease-out
        hover:shadow-lg hover:shadow-black/40
      "
      style={{
        border: "0.5px solid #1E3A5F",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#D4AF37";
        e.currentTarget.style.boxShadow = "0 0 0 0.5px #D4AF37";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#1E3A5F";
        e.currentTarget.style.boxShadow = "";
        if (!menuOpen && !moveOpen) { /* keep open if menu is open */ }
      }}
    >
      {/* ── Three-dot menu — top-right, visible on hover ── */}
      <div
        ref={menuRef}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10"
      >
        <button
          id={`task-menu-${task.id}`}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); setMoveOpen(false); }}
          className="
            w-6 h-6 rounded-full
            bg-steel text-iron
            hover:bg-gold hover:text-navy
            flex items-center justify-center
            transition-all duration-150
          "
        >
          <DotsIcon />
        </button>

        {menuOpen && (
          <div className="
            absolute right-0 top-8 w-44
            bg-navy border border-steel rounded-xl
            shadow-2xl shadow-black/60
            overflow-hidden z-20
            fade-in
          ">
            {/* Move to... sub-toggle */}
            <div ref={moveRef} className="relative">
              <button
                onClick={() => setMoveOpen(v => !v)}
                className="
                  w-full flex items-center justify-between
                  px-3.5 py-2.5 text-xs text-skyblue
                  hover:bg-steel hover:text-white
                  transition-colors duration-100
                "
              >
                <span className="font-mono">Move to...</span>
                <ChevronDown />
              </button>
              {moveOpen && (
                <div className="border-t border-steel">
                  {allStatuses
                    .filter(s => s !== task.status)
                    .map(s => (
                      <button
                        key={s}
                        id={`task-move-${task.id}-${s.replace(/\s/g, "")}`}
                        onClick={() => {
                          onMove(task.id, s);
                          setMenuOpen(false);
                          setMoveOpen(false);
                        }}
                        className="
                          w-full text-left px-5 py-2 text-xs text-iron
                          hover:bg-steel hover:text-skyblue
                          transition-colors font-mono
                        "
                      >
                        {s}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>

            <div className="border-t border-steel" />

            {/* Edit */}
            <button
              id={`task-edit-${task.id}`}
              onClick={() => { onEdit(task); setMenuOpen(false); }}
              className="
                w-full flex items-center gap-2.5
                px-3.5 py-2.5 text-xs text-skyblue
                hover:bg-steel hover:text-white
                transition-colors duration-100
              "
            >
              <EditIcon />
              <span className="font-mono">Edit task</span>
            </button>

            <div className="border-t border-steel" />

            {/* Delete */}
            <button
              id={`task-delete-${task.id}`}
              onClick={() => { onDelete(task.id); setMenuOpen(false); }}
              className="
                w-full flex items-center gap-2.5
                px-3.5 py-2.5 text-xs text-alert
                hover:bg-alert/10
                transition-colors duration-100
              "
            >
              <TrashIcon />
              <span className="font-mono">Delete task</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────── */}
      <div className="p-4 pr-10">

        {/* Priority indicator + title */}
        <div className="flex items-start gap-2.5 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            style={{ background: cfg.dot }}
          />
          <p
            className={`text-sm font-medium leading-snug ${
              isDone ? "line-through text-iron" : "text-white"
            }`}
          >
            {task.title}
          </p>
        </div>

        {/* Description — sky blue body copy */}
        {task.description && (
          <p className="text-xs text-skyblue leading-relaxed mb-3 ml-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* ── Footer metadata ─────────────────────────────── */}
        <div className="flex items-center justify-between ml-4 gap-2 flex-wrap">

          {/* Left: tags + due date in JetBrains Mono */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tags — transparent bg, sky blue text, no solid fill */}
            {task.tags?.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-skyblue font-mono border border-steel/80 rounded-lg px-1.5 py-0.5"
                style={{ fontSize: "10px" }}
              >
                {tag}
              </span>
            ))}

            {/* Due date */}
            <span
              className={`font-mono flex items-center gap-1 ${
                isOverdue ? "text-alert" : "text-iron"
              }`}
              style={{ fontSize: "10px" }}
            >
              <CalIcon />
              {task.due}
              {isOverdue && (
                <span className="text-alert" style={{ fontSize: "9px" }}>· overdue</span>
              )}
            </span>
          </div>

          {/* Right: assignee avatar + priority text */}
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs ${cfg.text}`}
              style={{ fontSize: "10px" }}
            >
              {cfg.label}
            </span>
            <div
              className="w-5 h-5 rounded-full bg-steel border border-steel/80
                         text-skyblue font-semibold flex items-center justify-center"
              style={{ fontSize: "9px" }}
              title={task.assignee}
            >
              {task.assignee?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}