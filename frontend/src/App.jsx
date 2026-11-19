import { useEffect, useState } from "react";

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

const navigation = [
    { id: "overview", icon: "▦", label: "Overview" },
    { id: "tasks", icon: "✓", label: "Tasks" },
    { id: "files", icon: "▤", label: "Files" },
    { id: "mail", icon: "✉", label: "Mail" }
];

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeView, setActiveView] = useState("overview");

    const fetchTasks = async () => {
        try {
            const data = await getTasks();
            setTasks(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to fetch tasks. Please check the API connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskAdded = async (taskData) => {
        const newTask = await createTask(taskData);
        setTasks((previous) => [newTask, ...previous]);
    };

    const handleToggle = async (task) => {
        try {
            const updatedTask = await updateTask(task.id, {
                completed: !task.completed
            });

            setTasks((previous) =>
                previous.map((item) =>
                    item.id === task.id ? updatedTask : item
                )
            );
        } catch (err) {
            console.error(err);
            setError("Unable to update task.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            setTasks((previous) =>
                previous.filter((task) => task.id !== id)
            );
        } catch (err) {
            console.error(err);
            setError("Unable to delete task.");
        }
    };

    const handleEditSave = async (id, taskData) => {
        const updatedTask = await updateTask(id, taskData);
        setTasks((previous) =>
            previous.map((task) =>
                task.id === id ? updatedTask : task
            )
        );
    };

    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    const pageTitles = {
        overview: ["Overview", "Here's what's happening with your workspace."],
        tasks: ["Tasks", "Create, organize and track your work."],
        files: ["File storage", "Manage your files securely with Amazon S3."],
        mail: ["Mail", "Your communication workspace."]
    };

    const [pageTitle, pageSubtitle] = pageTitles[activeView];

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">D</div>
                    <div>
                        <h2>DataEngine</h2>
                        <span>WORKSPACE</span>
                    </div>
                </div>

                <div className="workspace-label">WORKSPACE</div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeView === item.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveView(item.id);
                                setError("");
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.id === "tasks" && (
                                <span className="nav-count">{tasks.length}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="storage-card">
                        <div className="storage-icon">☁</div>
                        <strong>Cloud storage</strong>
                        <p>Your files are stored securely on AWS S3.</p>
                        <button onClick={() => setActiveView("files")}>
                            Manage files →
                        </button>
                    </div>

                    <div className="profile">
                        <div className="avatar">S</div>
                        <div className="profile-info">
                            <strong>Workspace Admin</strong>
                            <span>Administrator</span>
                        </div>
                        <span className="profile-menu">•••</span>
                    </div>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> <strong>{pageTitle}</strong>
                    </div>
                    <div className="topbar-right">
                        <span className="system-status">
                            <span className="status-dot"></span>
                            System online
                        </span>
                        <div className="topbar-avatar">S</div>
                    </div>
                </header>

                <div className="page-content">
                    <div className="page-heading">
                        <div>
                            <h1>{pageTitle}</h1>
                            <p>{pageSubtitle}</p>
                        </div>
                        {activeView === "overview" && (
                            <button
                                className="primary-button"
                                onClick={() => setActiveView("tasks")}
                            >
                                + Create task
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="error-banner">
                            {error}
                            <button onClick={() => setError("")}>×</button>
                        </div>
                    )}

                    {activeView === "overview" && (
                        <>
                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-top">
                                        <span>Total tasks</span>
                                        <span className="stat-icon purple">▦</span>
                                    </div>
                                    <strong>{loading ? "—" : tasks.length}</strong>
                                    <small>Tasks in your workspace</small>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-top">
                                        <span>Completed</span>
                                        <span className="stat-icon green">✓</span>
                                    </div>
                                    <strong>{loading ? "—" : completedTasks}</strong>
                                    <small>Successfully completed</small>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-top">
                                        <span>Pending</span>
                                        <span className="stat-icon orange">◷</span>
                                    </div>
                                    <strong>{loading ? "—" : pendingTasks}</strong>
                                    <small>Waiting for action</small>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-top">
                                        <span>Completion rate</span>
                                        <span className="stat-icon blue">↗</span>
                                    </div>
                                    <strong>
                                        {loading || tasks.length === 0
                                            ? "0%"
                                            : `${Math.round((completedTasks / tasks.length) * 100)}%`}
                                    </strong>
                                    <small>Based on all tasks</small>
                                </div>
                            </section>

                            <section className="content-panel overview-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Recent tasks</h2>
                                        <p>Your latest workspace activity</p>
                                    </div>
                                    <button
                                        className="text-button"
                                        onClick={() => setActiveView("tasks")}
                                    >
                                        View all tasks →
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="empty-state">Loading tasks...</div>
                                ) : tasks.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">✓</div>
                                        <strong>No tasks yet</strong>
                                        <p>Create your first task to get started.</p>
                                        <button
                                            className="primary-button"
                                            onClick={() => setActiveView("tasks")}
                                        >
                                            Create a task
                                        </button>
                                    </div>
                                ) : (
                                    <div className="recent-task-list">
                                        {tasks.slice(0, 5).map((task) => (
                                            <div className="recent-task" key={task.id}>
                                                <span className={`task-check ${task.completed ? "checked" : ""}`}>
                                                    {task.completed ? "✓" : ""}
                                                </span>
                                                <div className="recent-task-info">
                                                    <strong>{task.title}</strong>
                                                    <span>{task.description || "No description"}</span>
                                                </div>
                                                <span className={`task-status ${task.completed ? "done" : "pending"}`}>
                                                    {task.completed ? "Completed" : "Pending"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="quick-access-grid">
                                <button className="quick-card" onClick={() => setActiveView("tasks")}>
                                    <span className="quick-icon purple">✓</span>
                                    <span>
                                        <strong>Task management</strong>
                                        <small>Create and manage your tasks</small>
                                    </span>
                                    <span className="quick-arrow">→</span>
                                </button>

                                <button className="quick-card" onClick={() => setActiveView("files")}>
                                    <span className="quick-icon blue">▤</span>
                                    <span>
                                        <strong>Cloud file storage</strong>
                                        <small>Upload files to Amazon S3</small>
                                    </span>
                                    <span className="quick-arrow">→</span>
                                </button>
                            </section>
                        </>
                    )}

                    {activeView === "tasks" && (
                        <div className="tasks-layout">
                            <section className="content-panel task-form-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Create a task</h2>
                                        <p>Add a new item to your workspace.</p>
                                    </div>
                                </div>
                                <TaskForm onTaskAdded={handleTaskAdded} />
                            </section>

                            <section className="content-panel task-list-panel">
                                {loading ? (
                                    <div className="empty-state">Loading tasks...</div>
                                ) : (
                                    <TaskList
                                        tasks={tasks}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                        onEdit={handleEditSave}
                                    />
                                )}
                            </section>
                        </div>
                    )}

                    {activeView === "files" && (
                        <section className="content-panel file-panel">
                            <FileUpload />
                        </section>
                    )}

                    {activeView === "mail" && (
                        <section className="content-panel mail-preview">
                            <div className="mail-preview-icon">✉</div>
                            <span className="preview-label">COMING SOON</span>
                            <h2>Your communication hub</h2>
                            <p>
                                The Mail workspace is being prepared. Gmail and custom
                                mailbox connectivity will be configured separately.
                            </p>
                            <div className="mail-features">
                                <span>Inbox</span>
                                <span>Compose</span>
                                <span>Reply & forward</span>
                                <span>Attachments</span>
                            </div>
                        </section>
                    )}

                    <footer className="app-footer">
                        <span>DataEngine Workspace</span>
                        <span>Powered by AWS infrastructure</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default App;
