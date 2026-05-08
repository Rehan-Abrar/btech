// src/components/TaskCard.jsx
// Person A — Individual task card rendered inside KanbanBoard columns.
// Prop contract: { task, onEdit, onDelete, onMove, allStatuses }

const PRIORITY_STYLE = {
  High:   "bg-alert/10 text-alert border border-alert/30",
  Medium: "bg-amber/10 text-amber border border-amber/30",
  Low:    "bg-success/10 text-success border border-success/30",
};

const TAG_STYLE = "bg-steel text-skyblue text-xs px-2 py-0.5 rounded-lg font-mono";

const CalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

export default function TaskCard({ task, onEdit, onDelete, onMove, allStatuses }) {
  const today    = new Date().toISOString().split("T")[0];
  const isOverdue = task.due < today && task.status !== "Done";
  const isDone   = task.status === "Done";

  return (
    <div
      className="bg-richblack rounded-xl border border-steel mb-2.5
                 card-hover transition-all duration-200
                 hover:shadow-lg hover:shadow-black/30"
      style={{ borderColor: isDone ? "#22C55E33" : undefined }}
    >
      {/* ── Card body ─────────────────────────────────────── */}
      <div className="p-3.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p
            className={`text-sm font-medium leading-snug ${
              isDone ? "line-through text-iron" : "text-white"
            }`}
          >
            {task.title}
          </p>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg ${PRIORITY_STYLE[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-iron mb-2.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {task.tags.map(tag => (
              <span key={tag} className={TAG_STYLE}>{tag}</span>
            ))}
          </div>
        )}

        {/* Due date + assignee avatar */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-alert" : "text-iron"}`}>
            <CalIcon />
            <span className="font-mono">{task.due}</span>
            {isOverdue && <span className="text-alert font-medium">overdue</span>}
          </div>
          <div
            className="w-6 h-6 rounded-full bg-navy border border-steel
                       text-skyblue text-xs font-semibold
                       flex items-center justify-center"
            title={task.assignee}
          >
            {task.assignee?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Card footer: move + actions ───────────────────── */}
      <div className="border-t border-steel px-3 py-2 flex items-center gap-1.5">
        <select
          id={`task-move-${task.id}`}
          value={task.status}
          onChange={e => onMove(task.id, e.target.value)}
          className="flex-1 text-xs bg-navy border border-steel text-skyblue
                     rounded-lg px-2 py-1
                     focus:outline-none focus:border-gold
                     transition-colors cursor-pointer"
        >
          {allStatuses.map(s => (
            <option key={s} value={s} className="bg-navy text-white">
              {s}
            </option>
          ))}
        </select>

        <button
          id={`task-edit-${task.id}`}
          onClick={() => onEdit(task)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                     bg-steel text-skyblue
                     hover:bg-gold hover:text-navy
                     transition-all duration-150"
        >
          <EditIcon />
          Edit
        </button>

        <button
          id={`task-delete-${task.id}`}
          onClick={() => onDelete(task.id)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                     bg-steel text-iron
                     hover:bg-alert hover:text-white
                     transition-all duration-150"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}