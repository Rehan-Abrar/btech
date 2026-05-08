export default function CalendarView({ events }) {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold">Calendar</h2>
      <p className="mt-2 text-sm text-slate-500">{events.length} events loaded.</p>
    </section>
  );
}