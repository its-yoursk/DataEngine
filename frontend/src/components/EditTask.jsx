
import { useState } from "react";

function EditTask({ task, onSave, onCancel }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onSave(task._id, {
                title: title.trim(),
                description: description.trim()
            });

            onCancel();
        } catch (err) {
            console.error(err);
            setError("Unable to update task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Edit Task</h3>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
            />

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </button>

            <button type="button" onClick={onCancel}>
                Cancel
            </button>
        </form>
    );
}

export default EditTask;
