
import { useState } from "react";
import EditTask from "./EditTask";

function TaskList({ tasks, onToggle, onDelete, onEdit }) {
    const [editingTaskId, setEditingTaskId] = useState(null);

    return (
        <div>
            <h2>My Tasks ({tasks.length})</h2>

            {tasks.length === 0 ? (
                <p>No tasks available.</p>
            ) : (
                tasks.map((task) => (
                    <div key={task.id}>
                        {editingTaskId === task.id ? (
                            <EditTask
                                key={task.id}
                                task={task}
                                onSave={onEdit}
                                onCancel={() => setEditingTaskId(null)}
                            />
                        ) : (
                            <>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <p>
                                    Status: {task.completed
                                        ? "Completed"
                                        : "Pending"}
                                </p>

                                <button onClick={() => onToggle(task)}>
                                    {task.completed
                                        ? "Mark Pending"
                                        : "Mark Completed"}
                                </button>

                                <button onClick={() => setEditingTaskId(task.id)}>
                                    Edit
                                </button>

                                <button onClick={() => onDelete(task.id)}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default TaskList;
