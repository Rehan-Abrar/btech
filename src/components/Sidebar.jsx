import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/board", label: "Board" },
  { to: "/calendar", label: "Calendar" },
  { to: "/ai", label: "AI Chat" },
];

export default function Sidebar({ user }) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Axon</h1>
        <p className="text-sm text-slate-500">AI task automation</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
        <p>{user?.role ?? "User"}</p>
      </div>
    </aside>
  );
}