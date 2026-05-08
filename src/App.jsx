import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import AIChat from "./components/AIChat";
import TaskModal from "./components/TaskModal";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar user={{ role: "Student" }} onAddTask={() => {}} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard tasks={[]} onAddTask={() => {}} />} />
            <Route path="/board" element={<KanbanBoard tasks={[]} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} onMove={() => {}} />} />
            <Route path="/calendar" element={<CalendarView tasks={[]} events={[]} />} />
            <Route path="/ai" element={<AIChat tasks={[]} onEventCreate={() => {}} />} />
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <TaskModal task={null} onSave={() => {}} onClose={() => {}} />
      </div>
    </BrowserRouter>
  );
}