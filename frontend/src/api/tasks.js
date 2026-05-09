// src/api/tasks.js
// Day 2: uncomment and wire these to the Express backend.
// Replace useState(mockTasks) in App.jsx with:
//   const [tasks, setTasks] = useState([]);
//   useEffect(() => { fetchTasks().then(setTasks); }, []);

export const fetchTasks = async () => {
  // Day 2: return await fetch("/api/tasks").then(r => r.json());
};

export const createTask = async (task) => {
  // Day 2: return await fetch("/api/tasks", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(task),
  // }).then(r => r.json());
};

export const updateTask = async (id, task) => {
  // Day 2: return await fetch(`/api/tasks/${id}`, {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(task),
  // }).then(r => r.json());
};

export const deleteTask = async (id) => {
  // Day 2: return await fetch(`/api/tasks/${id}`, { method: "DELETE" }).then(r => r.json());
};