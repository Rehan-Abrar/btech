// src/components/FilterBar.jsx
// AXON Brand — pill-shaped selects, JetBrains Mono labels, sentence case.
// Filter state stays in KanbanBoard (plan.md failure mode #1).

export default function FilterBar({ onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-1">
      {/* Priority filter */}
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-iron"
          style={{ fontSize: "11px", letterSpacing: "0.04em" }}
        >
          Priority
        </span>
        <div className="relative">
          <select
            id="filter-priority"
            onChange={e => handleChange("priority", e.target.value)}
            className="
              appearance-none
              bg-navy border text-skyblue font-mono text-xs
              rounded-pill pl-3 pr-7 py-1.5
              focus:outline-none focus:border-gold
              transition-colors cursor-pointer
            "
            style={{
              borderColor: "#1E3A5F",
              fontSize: "11px",
            }}
          >
            <option value="All"    className="bg-navy text-white">All priorities</option>
            <option value="High"   className="bg-navy text-white">High</option>
            <option value="Medium" className="bg-navy text-white">Medium</option>
            <option value="Low"    className="bg-navy text-white">Low</option>
          </select>
          {/* Custom chevron */}
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-iron"
            width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Subtle divider */}
      <span className="w-px h-4 bg-steel" />

      {/* Active task count indicator — reads from parent implicitly via DOM; purely decorative label */}
      <span
        className="font-mono text-iron"
        style={{ fontSize: "11px" }}
      >
        Task board
      </span>
    </div>
  );
}