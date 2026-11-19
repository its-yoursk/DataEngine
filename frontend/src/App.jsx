
import { useState, useEffect } from "react";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from "./services/taskService";

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import FileUpload from "./components/FileUpload";

import "./App.css";

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            const data = await getTasks();
            setTasks(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to fetch tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Create task
    const handleTaskAdded = async (taskData) => {
        const newTask = await createTask(taskData);

        setTasks((previousTasks) => [
            newTask,
            ...previousTasks
        ]);
    };

    // Toggle task completion
    const handleToggle = async (task) => {
        try {
            const updatedTask = await updateTask(task.id, {
                completed: !task.completed
            });

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );
        } catch (err) {
            console.error(err);
            setError("Unable to update task.");
        }
    };

    // Delete task
    const handleDelete = async (id) => {
        try {
            await deleteTask(id);

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== id)
            );
        } catch (err) {
            console.error(err);
            setError("Unable to delete task.");
        }
    };


    const handleEditSave = async (id, taskData) => {
        const updatedTask = await updateTask(id, taskData);

        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === id ? updatedTask : task
            )
        );
    };


    return (
        <div>
            <h1>DataEngine Task</h1>

            <TaskForm onTaskAdded={handleTaskAdded} />

            <FileUpload />

            {error && <p>{error}</p>}

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <TaskList
                    tasks={tasks}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEditSave}
                />
            )}
        </div>
    );
}

export default App;
