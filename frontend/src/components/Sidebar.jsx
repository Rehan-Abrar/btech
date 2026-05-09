// src/components/Sidebar.jsx
// Person A — Fixed left navigation. Role-aware links per plan.md.
// Student  → Dashboard | My Tasks | AI Chat
// Manager  → Dashboard | Calendar | Get Schedule

import { useState } from "react";
import { NavLink }  from "react-router-dom";

// ── SVG icon components (no emoji, professional) ──────────────
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconBoard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="11" rx="1"/><rect x="17" y="3" width="5" height="14" rx="1"/>
  </svg>
);
const IconAI = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconSchedule = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconAxon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#D4AF37"/>
    <line x1="12" y1="9"  x2="7"  y2="4"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="9"  x2="17" y2="4"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="7"  y2="20" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="17" y2="20" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const studentLinks = [
  { to: "/",     icon: <IconDashboard />, label: "Dashboard" },
  { to: "/board", icon: <IconBoard />,   label: "My Tasks"  },
  { to: "/ai",    icon: <IconAI />,      label: "AI Chat"   },
];

const managerLinks = [
  { to: "/",           icon: <IconDashboard />, label: "Dashboard"    },
  { to: "/calendar",   icon: <IconCalendar />,  label: "Calendar"     },
  { to: "/ai/schedule",icon: <IconSchedule />,  label: "Get Schedule" },
];

export default function Sidebar({ user, onAddTask, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = user?.role === "Manager" ? managerLinks : studentLinks;

  return (
    <aside
      className={`
        relative flex flex-col shrink-0
        border-r border-steel backdrop-blur-md
        transition-all duration-300
        ${collapsed ? "w-16" : "w-60"}
      `}
      style={{ minHeight: "100vh", background: "rgba(10,38,71,0.45)" }}
    >
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-steel ${collapsed ? "justify-center" : ""}`}>
        <IconAxon />
        {!collapsed && (
          <div>
            <span
              className="text-gold font-semibold tracking-widest text-sm uppercase"
              style={{ letterSpacing: "0.12em" }}
            >
              AXON
            </span>
            <p className="text-iron text-xs font-mono mt-0.5" style={{ fontSize: "10px" }}>
              AI Task Automation
            </p>
          </div>
        )}
      </div>

      {/* ── New Task button ───────────────────────────────── */}
      <div className={`px-3 py-4 ${collapsed ? "flex justify-center" : ""}`}>
        <button
          id="sidebar-new-task-btn"
          onClick={onAddTask}
          className={`
            flex items-center gap-2 bg-gold text-navy
            font-medium text-sm rounded-pill
            hover:brightness-110 active:scale-95
            transition-all duration-150
            ${collapsed ? "w-10 h-10 justify-center p-0" : "w-full py-2.5 px-4"}
          `}
        >
          <IconPlus />
          {!collapsed && <span>New Task</span>}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
               transition-all duration-150 group
               ${collapsed ? "justify-center" : ""}
               ${
                 isActive
                   ? "nav-active bg-steel text-gold font-medium"
                   : "text-skyblue hover:bg-steel hover:text-white"
               }`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User avatar & Logout ────────────────────────────── */}
      <div className={`border-t border-steel px-3 py-4 flex flex-col gap-3 ${collapsed ? "items-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div
            className="w-9 h-9 rounded-full bg-gold text-navy text-xs font-bold
                       flex items-center justify-center shrink-0"
          >
            {user?.avatar ?? "DU"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-iron truncate">{user?.role}</p>
            </div>
          )}
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
                        text-iron hover:text-white hover:bg-steel/30
                        ${collapsed ? "justify-center" : ""}`}
            style={{ marginTop: '4px' }}
          >
            <div className="shrink-0 text-red-400">
              <IconLogout />
            </div>
            {!collapsed && (
              <span className="text-sm font-medium text-red-400">Sign Out</span>
            )}
          </button>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────── */}
      <button
        id="sidebar-collapse-btn"
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full
                   bg-navy border border-steel text-iron
                   flex items-center justify-center
                   hover:border-gold hover:text-gold
                   transition-all duration-150 z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
        >
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </aside>
  );
}