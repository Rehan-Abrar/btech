export const chatWithAI = async (message, taskContext) => ({ reply: message, taskContext });
export const generateSchedule = async (tasks) => ({ schedule: tasks });