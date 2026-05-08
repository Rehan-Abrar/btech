import FilterBar from "./FilterBar";

export default function KanbanBoard({ tasks }) {
  return (
    <section className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Board</h2>
        <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">New Task</button>
      </div>
      <FilterBar onFilterChange={() => {}} />
      <pre className="mt-4 overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-xs">{JSON.stringify(tasks, null, 2)}</pre>
    </section>
  );
}