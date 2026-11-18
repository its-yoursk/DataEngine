
import axios from "axios";

// Backend API configuration
const API = axios.create({
    baseURL: "/api/tasks"
});

// Fetch all tasks
export const getTasks = async () => {
    const response = await API.get("/");
    return response.data;
};

// Create a new task
export const createTask = async (taskData) => {
    const response = await API.post("/", taskData);
    return response.data;
};

// Update an existing task
export const updateTask = async (id, taskData) => {
    const response = await API.put(`/${id}`, taskData);
    return response.data;
};

// Delete a task
export const deleteTask = async (id) => {
    const response = await API.delete(`/${id}`);
    return response.data;
};
