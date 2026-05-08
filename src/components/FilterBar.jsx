// src/components/FilterBar.jsx
// Person B owns this component.
// Filter logic (state) stays in KanbanBoard.jsx — this only calls onFilterChange.
// Person A depends on this in KanbanBoard.

export default function FilterBar({ onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  };

  const selectClass = `
    text-xs bg-navy border border-steel text-skyblue
    rounded-pill px-3 py-1.5
    focus:outline-none focus:border-gold
    transition-colors cursor-pointer
    font-mono
  `;

  return (
    <div className="flex flex-wrap gap-3 mb-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-iron uppercase tracking-wider">Priority</span>
        <select
          id="filter-priority"
          onChange={e => handleChange("priority", e.target.value)}
          className={selectClass}
        >
          <option value="All">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </div>
  );
}