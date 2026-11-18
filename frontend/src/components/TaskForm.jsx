
import { useState } from "react";

function TaskForm({ onTaskAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onTaskAdded({
                title: title.trim(),
                description: description.trim(),
                completed: false
            });

            setTitle("");
            setDescription("");
        } catch (err) {
            setError("Unable to create task. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Task</h2>

            <div>
                <label htmlFor="title">Task Title</label>
                <input
                    id="title"
                    type="text"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Task"}
            </button>
        </form>
    );
}

export default TaskForm;
