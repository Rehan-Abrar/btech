export default function Dashboard({ tasks }) {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="mt-2 text-sm text-slate-500">{tasks.length} tasks loaded.</p>
    </section>
  );
}