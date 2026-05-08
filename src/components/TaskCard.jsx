export default function TaskCard({ task }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-4 text-sm">{task?.title ?? "Task"}</article>;
}