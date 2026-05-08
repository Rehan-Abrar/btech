// src/components/Dashboard.jsx
// Person A — All stats computed live from props. No hardcoded numbers.
// Includes: 4 stat cards, completion bar chart, priority pie chart (pure SVG), recent activity feed.

import EmptyState from "./EmptyState";

// ── Palette tokens (mirrors brand identity) ──────────────────
const PRIORITY_DOT = {
  High:   "bg-alert",
  Medium: "bg-amber",
  Low:    "bg-success",
};
const STATUS_BAR = {
  "To Do":      { fill: "#5A6380", label: "To Do"       },
  "In Progress":{ fill: "#D4AF37", label: "In Progress" },
  "Review":     { fill: "#87CEEB", label: "Review"      },
  "Done":       { fill: "#22C55E", label: "Done"        },
};

// ── Mini bar chart (pure SVG, no lib) ────────────────────────
function StatusBarChart({ tasks }) {
  const total = tasks.length || 1;
  const data = Object.entries(STATUS_BAR).map(([status, meta]) => ({
    ...meta,
    count: tasks.filter(t => t.status === status).length,
    pct:   Math.round((tasks.filter(t => t.status === status).length / total) * 100),
  }));

  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.label}>
          <div className="flex justify-between text-xs text-skyblue mb-1">
            <span>{d.label}</span>
            <span className="font-mono text-white">{d.count}</span>
          </div>
          <div className="h-2 bg-steel rounded-pill overflow-hidden">
            <div
              className="h-full rounded-pill col-bar transition-all"
              style={{ width: `${d.pct}%`, background: d.fill }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Priority donut (pure SVG) ─────────────────────────────────
function PriorityDonut({ tasks }) {
  const total  = tasks.length || 1;
  const high   = tasks.filter(t => t.priority === "High").length;
  const medium = tasks.filter(t => t.priority === "Medium").length;
  const low    = tasks.filter(t => t.priority === "Low").length;

  const R  = 36;
  const C  = 2 * Math.PI * R; // circumference ≈ 226

  const highPct   = high   / total;
  const medPct    = medium / total;
  const lowPct    = low    / total;

  // Offsets for stacked donut segments
  const highOff   = 0;
  const medOff    = C * highPct;
  const lowOff    = C * (highPct + medPct);

  const segments = [
    { pct: highPct,  color: "#FF4D4D", offset: highOff,  label: "High",   count: high   },
    { pct: medPct,   color: "#F5A623", offset: medOff,   label: "Medium", count: medium },
    { pct: lowPct,   color: "#22C55E", offset: lowOff,   label: "Low",    count: low    },
  ];

  return (
    <div className="flex items-center gap-6">
      <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="48" cy="48" r={R} fill="none" stroke="#1E3A5F" strokeWidth="10"/>
        {segments.map(s => (
          <circle
            key={s.label}
            cx="48" cy="48" r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={`${s.pct * C} ${C}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
        {/* Center text — rotated back */}
        <text
          x="48" y="53"
          textAnchor="middle"
          fontSize="18"
          fontWeight="600"
          fill="#FFFFFF"
          style={{ transform: "rotate(90deg)", transformOrigin: "48px 48px" }}
        >
          {tasks.length}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-skyblue text-xs">{s.label}</span>
            <span className="text-white font-mono text-xs ml-auto pl-3">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Completion progress ring ──────────────────────────────────
function CompletionRing({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const R   = 20;
  const C   = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-2">
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={R} fill="none" stroke="#1E3A5F" strokeWidth="6"/>
        <circle
          cx="26" cy="26" r={R}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
        />
      </svg>
      <span className="text-2xl font-semibold text-white">{pct}%</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard({ tasks, onAddTask }) {
  const today     = new Date().toISOString().split("T")[0];
  const total     = tasks.length;
  const done      = tasks.filter(t => t.status === "Done").length;
  const inProg    = tasks.filter(t => t.status === "In Progress").length;
  const overdue   = tasks.filter(t => t.due < today && t.status !== "Done").length;
  const dueToday  = tasks.filter(t => t.due === today && t.status !== "Done").length;

  const statCards = [
    {
      id: "stat-total",
      label: "Total Tasks",
      value: total,
      sub: "all tasks",
      accent: "#87CEEB",
      border: "#1E3A5F",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#87CEEB" strokeWidth="1.8" strokeLinecap="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    {
      id: "stat-done",
      label: "Completed",
      value: done,
      sub: `${total > 0 ? Math.round((done/total)*100) : 0}% done`,
      accent: "#22C55E",
      border: "#22C55E",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
    {
      id: "stat-inprogress",
      label: "In Progress",
      value: inProg,
      sub: "active now",
      accent: "#D4AF37",
      border: "#D4AF37",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      id: "stat-overdue",
      label: "Overdue",
      value: overdue,
      sub: overdue > 0 ? "needs attention" : "all on track",
      accent: overdue > 0 ? "#FF4D4D" : "#22C55E",
      border: overdue > 0 ? "#FF4D4D" : "#22C55E",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={overdue > 0 ? "#FF4D4D" : "#22C55E"} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
  ];

  // Recent = last 5 by id desc
  const recent = [...tasks].sort((a, b) => b.id - a.id).slice(0, 5);

  const priorityBadge = {
    High:   "bg-alert/10 text-alert border border-alert/20",
    Medium: "bg-amber/10 text-amber border border-amber/20",
    Low:    "bg-success/10 text-success border border-success/20",
  };
  const statusBadge = {
    "To Do":       "text-iron",
    "In Progress": "text-gold",
    "Review":      "text-skyblue",
    "Done":        "text-success",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-skyblue text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {dueToday > 0 && (
              <span className="ml-3 text-amber font-medium">{dueToday} task{dueToday > 1 ? "s" : ""} due today</span>
            )}
          </p>
        </div>
        <button
          id="dashboard-new-task-btn"
          onClick={onAddTask}
          className="flex items-center gap-2 bg-gold text-navy font-medium text-sm
                     rounded-pill py-2.5 px-5
                     hover:brightness-110 active:scale-95 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Task
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div
            key={s.id}
            id={s.id}
            className="bg-navy rounded-2xl p-5 card-hover"
            style={{ border: `0.5px solid ${s.border}33` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-steel flex items-center justify-center">
                {s.icon}
              </div>
              <span className="text-xs font-mono" style={{ color: s.accent }}>
                {s.sub}
              </span>
            </div>
            <p className="text-3xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-skyblue mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column charts row ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Completion ring + status bars — spans 2 cols */}
        <div className="lg:col-span-2 bg-navy rounded-2xl p-6 border border-steel card-hover">
          <h2 className="text-sm font-medium text-white mb-5">Task progress by status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs text-skyblue mb-3">Completion rate</p>
              <CompletionRing done={done} total={total} />
            </div>
            <StatusBarChart tasks={tasks} />
          </div>
        </div>

        {/* Priority donut */}
        <div className="bg-navy rounded-2xl p-6 border border-steel card-hover">
          <h2 className="text-sm font-medium text-white mb-5">Priority breakdown</h2>
          {total === 0
            ? <EmptyState message="No tasks yet" small />
            : <PriorityDonut tasks={tasks} />
          }
        </div>
      </div>

      {/* ── Recent activity ──────────────────────────────────── */}
      <div className="bg-navy rounded-2xl border border-steel overflow-hidden card-hover">
        <div className="flex items-center justify-between px-6 py-4 border-b border-steel">
          <h2 className="text-sm font-medium text-white">Recent activity</h2>
          <span className="text-xs text-iron">{recent.length} tasks</span>
        </div>
        {recent.length === 0
          ? <EmptyState message="No tasks yet. Create your first one!" />
          : (
            <div className="divide-y divide-steel">
              {recent.map(t => {
                const isOverdue = t.due < today && t.status !== "Done";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-steel/40 transition-colors"
                  >
                    {/* Left: dot + title + meta */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background:
                            t.priority === "High"   ? "#FF4D4D" :
                            t.priority === "Medium" ? "#F5A623" : "#22C55E"
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{t.title}</p>
                        <p className="text-xs text-iron mt-0.5">
                          Due{" "}
                          <span className={isOverdue ? "text-alert" : "text-skyblue"}>
                            {t.due}
                          </span>
                          {" · "}{t.assignee}
                        </p>
                      </div>
                    </div>
                    {/* Right: priority + status */}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${priorityBadge[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className={`text-xs font-mono ${statusBadge[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>
    </div>
  );
}