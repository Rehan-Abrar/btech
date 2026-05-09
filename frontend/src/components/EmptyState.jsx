// src/components/EmptyState.jsx
// Person C owns this component — this is the production version.
// Person A depends on it in Dashboard, KanbanBoard, and CalendarView.

const AxonMark = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#1E3A5F"/>
    <line x1="12" y1="9"  x2="7"  y2="4"  stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="9"  x2="17" y2="4"  stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="7"  y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="17" y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function EmptyState({ message = "Nothing here yet", small = false }) {
  if (small) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
        <div className="w-8 h-8 rounded-full bg-steel flex items-center justify-center mb-2">
          <AxonMark />
        </div>
        <p className="text-xs text-iron">{message}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-navy border border-steel flex items-center justify-center mb-4">
        <AxonMark />
      </div>
      <p className="text-base font-medium text-white">{message}</p>
      <p className="text-sm text-iron mt-1">Try adding something to get started.</p>
    </div>
  );
}