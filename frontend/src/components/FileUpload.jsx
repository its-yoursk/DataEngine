import { useCallback, useEffect, useState } from "react";
import "./FileUpload.css";

function formatBytes(bytes) {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    return `${(bytes / (1024 ** index)).toFixed(1)} ${units[index]}`;
}

function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function FileUpload() {
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeFile, setActiveFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/uploads");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load files.");
            }

            setFiles(data.files || []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to load files.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setMessage("");
            setError("");

            const response = await fetch("/api/uploads", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed.");
            }

            setMessage("File uploaded successfully.");
            setFile(null);
            e.target.reset();

            await loadFiles();
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to upload file.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            setActiveFile(id);
            setError("");

            const response = await fetch(`/api/uploads/${id}/download`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to download file.");
            }

            if (!data.downloadUrl) {
                throw new Error("Download URL was not returned by the server.");
            }

            const link = document.createElement("a");
            link.href = data.downloadUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to download file.");
        } finally {
            setActiveFile(null);
        }
    };

    const handleDelete = async (id, name) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

        if (!confirmed) return;

        try {
            setActiveFile(id);
            setError("");
            setMessage("");

            const response = await fetch(`/api/uploads/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete file.");
            }

            setFiles((previous) =>
                previous.filter((item) => item.id !== id)
            );

            setMessage("File deleted successfully.");
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to delete file.");
        } finally {
            setActiveFile(null);
        }
    };

    return (
        <div className="file-manager">
            <div className="file-manager-heading">
                <div>
                    <h2>Cloud file storage</h2>
                    <p>Upload, access and manage your files securely.</p>
                </div>

                <button
                    className="file-refresh-button"
                    onClick={loadFiles}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>
            </div>

            <div className="file-upload-area">
                <div className="file-upload-symbol">↑</div>

                <h3>Upload a new file</h3>
                <p>Supported formats: JPG, PNG, PDF and TXT. Maximum size: 40 MB.</p>

                <form onSubmit={handleUpload}>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.txt"
                        onChange={(e) => setFile(e.target.files[0] || null)}
                    />

                    <button
                        type="submit"
                        disabled={uploading || !file}
                    >
                        {uploading ? "Uploading..." : "Upload to cloud"}
                    </button>
                </form>

                {file && (
                    <div className="selected-file">
                        Selected: {file.name} ({formatBytes(file.size)})
                    </div>
                )}
            </div>

            {message && (
                <div className="file-success-message">{message}</div>
            )}

            {error && (
                <div className="file-error-message">{error}</div>
            )}

            <div className="file-list-heading">
                <div>
                    <h3>Stored files</h3>
                    <p>{files.length} file{files.length !== 1 ? "s" : ""} in your storage</p>
                </div>
            </div>

            {loading ? (
                <div className="file-empty-state">Loading your files...</div>
            ) : files.length === 0 ? (
                <div className="file-empty-state">
                    <span>▤</span>
                    <strong>No files found</strong>
                    <p>Upload your first file to see it here.</p>
                </div>
            ) : (
                <div className="file-table-wrapper">
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th>FILE NAME</th>
                                <th>TYPE</th>
                                <th>SIZE</th>
                                <th>UPLOADED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {files.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="file-name-cell">
                                            <span className="file-type-icon">
                                                {item.content_type?.includes("pdf")
                                                    ? "PDF"
                                                    : item.content_type?.startsWith("image/")
                                                        ? "IMG"
                                                        : "TXT"}
                                            </span>
                                            <strong>{item.original_name}</strong>
                                        </div>
                                    </td>

                                    <td>{item.content_type || "Unknown"}</td>
                                    <td>{formatBytes(item.size_bytes)}</td>
                                    <td>{formatDate(item.created_at)}</td>

                                    <td>
                                        <div className="file-actions">
                                            <button
                                                className="file-download-button"
                                                onClick={() => handleDownload(item.id)}
                                                disabled={activeFile === item.id}
                                            >
                                                Download
                                            </button>

                                            <button
                                                className="file-delete-button"
                                                onClick={() =>
                                                    handleDelete(item.id, item.original_name)
                                                }
                                                disabled={activeFile === item.id}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
