// src/components/TaskModal.jsx
// Person B owns this component — this production stub ensures Person A's shell compiles.
// Prop contract: task=null → create mode; task=object → edit mode
// onSave(task), onClose()

import { useState, useEffect } from "react";
import { PRIORITIES, STATUSES } from "../data/mockTasks";

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const inputClass = `
  w-full bg-steel border border-steel/60 text-white text-sm rounded-xl
  px-4 py-2.5 placeholder:text-iron font-mono
  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30
  transition-all
`;

const labelClass = "block text-xs font-medium text-iron uppercase tracking-wider mb-1.5";

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium",
    status: "To Do", due: "", assignee: "", tags: [],
  });

  // Populate form when editing — plan failure mode #2: must include task in deps
  useEffect(() => {
    if (task) setForm(task);
  }, [task]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) { alert("Title is required"); return; }
    if (!form.due)           { alert("Due date is required"); return; }
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-navy border border-steel rounded-2xl shadow-2xl w-full max-w-lg relative">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-steel">
          <h2 className="text-base font-semibold text-white">
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-steel text-iron hover:text-white hover:bg-steel/80 flex items-center justify-center transition-all"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              id="modal-title"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Task title..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              id="modal-description"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              placeholder="What needs to be done?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Priority</label>
              <select
                id="modal-priority"
                value={form.priority}
                onChange={e => set("priority", e.target.value)}
                className={inputClass}
              >
                {PRIORITIES.map(p => <option key={p} value={p} className="bg-navy">{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                id="modal-status"
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className={inputClass}
              >
                {STATUSES.map(s => <option key={s} value={s} className="bg-navy">{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due date *</label>
              <input
                id="modal-due"
                type="date"
                value={form.due}
                onChange={e => set("due", e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className={labelClass}>Assignee</label>
              <input
                id="modal-assignee"
                value={form.assignee}
                onChange={e => set("assignee", e.target.value)}
                placeholder="Name"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-steel">
          <button
            id="modal-cancel-btn"
            onClick={onClose}
            className="px-5 py-2 text-sm text-skyblue border border-steel rounded-pill hover:bg-steel transition-all"
          >
            Cancel
          </button>
          <button
            id="modal-save-btn"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium bg-gold text-navy rounded-pill hover:brightness-110 active:scale-95 transition-all"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}