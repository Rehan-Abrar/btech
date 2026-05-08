import { useState, useEffect } from "react";

const STATUSES = ["To Do", "In Progress", "Review", "Done"];
const PRIORITIES = ["High", "Medium", "Low"];

// AXON Color Palette
const COLORS = {
  navyBlue: "#0A2647",
  mustardGold: "#D4AF37",
  pureWhite: "#FFFFFF",
  richBlack: "#1A1A1A",
  skyBlue: "#87CEEB",
  steelRim: "#1E3A5F",
  alertRed: "#FF4D4D",
  cautionAmber: "#F5A623",
  taskGreen: "#22C55E",
  ironGray: "#5A6380",
};

const PRIORITY_BADGE = {
  High: { bg: "bg-red-900", text: "text-red-300", border: "border-red-700" },
  Medium: { bg: "bg-amber-900", text: "text-amber-300", border: "border-amber-700" },
  Low: { bg: "bg-green-900", text: "text-green-300", border: "border-green-700" },
};

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    due: "",
    assignee: "",
    tags: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm(task);
    } else {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setForm(prev => ({
        ...prev,
        due: tomorrow.toISOString().split("T")[0],
      }));
    }
    setErrors({});
  }, [task]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Task title required.";
    if (!form.due) newErrors.due = "Due date required.";
    
    const selectedDate = new Date(form.due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.due = "Due date cannot be in the past.";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(form);
  };

  const isEditMode = !!task;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26, 26, 26, 0.6)" }}
    >
      <div 
        className="w-full max-w-lg rounded-2xl shadow-2xl p-8 relative border"
        style={{
          backgroundColor: COLORS.navyBlue,
          borderColor: COLORS.steelRim,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-opacity-60 hover:text-opacity-100 transition text-2xl font-light"
          style={{ color: COLORS.skyBlue }}
        >
          ×
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 
            className="text-2xl font-medium"
            style={{ color: COLORS.pureWhite }}
          >
            {isEditMode ? `Edit task` : `Create new task`}
          </h2>
          <p 
            className="text-sm mt-1 font-regular"
            style={{ color: COLORS.skyBlue }}
          >
            {isEditMode ? `Modify task details below.` : `Set up your task below. AI will help with scheduling.`}
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          {/* Title Field */}
          <div>
            <label 
              className="block text-xs font-medium mb-2 uppercase tracking-wide"
              style={{ color: COLORS.skyBlue }}
            >
              Task Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
              placeholder="E.g., Design landing page mockups"
              className="w-full px-4 py-3 rounded-full text-sm transition outline-none"
              style={{
                backgroundColor: COLORS.richBlack,
                borderWidth: "1px",
                borderColor: errors.title ? COLORS.alertRed : COLORS.mustardGold,
                color: COLORS.pureWhite,
              }}
              onFocus={e => e.target.style.borderColor = COLORS.mustardGold}
            />
            {errors.title && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: COLORS.alertRed }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label 
              className="block text-xs font-medium mb-2 uppercase tracking-wide"
              style={{ color: COLORS.skyBlue }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
              placeholder="What needs to be done? Add context, requirements, or notes here."
              className="w-full px-4 py-3 rounded-2xl text-sm transition outline-none resize-none"
              style={{
                backgroundColor: COLORS.richBlack,
                borderWidth: "1px",
                borderColor: COLORS.mustardGold,
                color: COLORS.pureWhite,
              }}
            />
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority Dropdown */}
            <div>
              <label 
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: COLORS.skyBlue }}
              >
                Priority
              </label>
              <select
                value={form.priority}
                onChange={e => handleChange("priority", e.target.value)}
                className="w-full px-4 py-3 rounded-full text-sm transition outline-none appearance-none font-regular"
                style={{
                  backgroundColor: COLORS.richBlack,
                  borderWidth: "1px",
                  borderColor: COLORS.mustardGold,
                  color: COLORS.pureWhite,
                }}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p} style={{ backgroundColor: COLORS.navyBlue, color: COLORS.pureWhite }}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label 
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: COLORS.skyBlue }}
              >
                Status
              </label>
              <select
                value={form.status}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-full text-sm transition outline-none appearance-none font-regular"
                style={{
                  backgroundColor: COLORS.richBlack,
                  borderWidth: "1px",
                  borderColor: COLORS.mustardGold,
                  color: COLORS.pureWhite,
                }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} style={{ backgroundColor: COLORS.navyBlue, color: COLORS.pureWhite }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date Field */}
            <div>
              <label 
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: COLORS.skyBlue }}
              >
                Due Date *
              </label>
              <input
                type="date"
                value={form.due}
                onChange={e => handleChange("due", e.target.value)}
                className="w-full px-4 py-3 rounded-full text-sm transition outline-none"
                style={{
                  backgroundColor: COLORS.richBlack,
                  borderWidth: "1px",
                  borderColor: errors.due ? COLORS.alertRed : COLORS.mustardGold,
                  color: COLORS.pureWhite,
                }}
              />
              {errors.due && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: COLORS.alertRed }}>
                  {errors.due}
                </p>
              )}
            </div>

            {/* Assignee Field */}
            <div>
              <label 
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: COLORS.skyBlue }}
              >
                Assignee
              </label>
              <input
                type="text"
                value={form.assignee}
                onChange={e => handleChange("assignee", e.target.value)}
                placeholder="E.g., Alex, Sam"
                className="w-full px-4 py-3 rounded-full text-sm transition outline-none"
                style={{
                  backgroundColor: COLORS.richBlack,
                  borderWidth: "1px",
                  borderColor: COLORS.mustardGold,
                  color: COLORS.pureWhite,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 justify-end">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium rounded-full transition border-2"
            style={{
              backgroundColor: "transparent",
              borderColor: COLORS.steelRim,
              color: COLORS.skyBlue,
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = COLORS.skyBlue;
              e.target.style.backgroundColor = `${COLORS.navyBlue}80`;
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = COLORS.steelRim;
              e.target.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>

          {/* Save / Create Button */}
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-sm font-medium rounded-full transition"
            style={{
              backgroundColor: COLORS.mustardGold,
              color: COLORS.navyBlue,
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = "#E5C158";
              e.target.style.boxShadow = `0 0 16px ${COLORS.mustardGold}40`;
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = COLORS.mustardGold;
              e.target.style.boxShadow = "none";
            }}
          >
            {isEditMode ? "Save changes" : "Create task"}
          </button>
        </div>

        {/* AI Hint */}
        <p 
          className="text-xs mt-6 text-center font-regular italic"
          style={{ color: COLORS.ironGray }}
        >
          ✦ AXON will auto-schedule this task once created.
        </p>
      </div>
    </div>
  );
}