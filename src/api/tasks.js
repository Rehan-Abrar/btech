export const fetchTasks = async () => [];
export const createTask = async (task) => task;
export const updateTask = async (id, task) => ({ id, ...task });
export const deleteTask = async (id) => ({ success: true, id });