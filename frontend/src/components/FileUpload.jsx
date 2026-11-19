import { useState } from "react";
import "./FileUpload.css";

function FileUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessage("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setMessage("");
            setUploadedFile(null);

            const response = await fetch("/api/uploads", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            setUploadedFile(data.upload);
            setMessage("File uploaded successfully!");
            setFile(null);
            e.target.reset();

        } catch (error) {
            setMessage(error.message || "Unable to upload file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="upload-card">
            <h2>File Storage</h2>
            <p>Upload files securely to Amazon S3.</p>

            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                />

                <button type="submit" disabled={loading || !file}>
                    {loading ? "Uploading..." : "Upload File"}
                </button>
            </form>

            <p className="upload-message">{message}</p>

            {uploadedFile && (
                <div className="uploaded-info">
                    <strong>Uploaded File</strong>
                    <p>Name: {uploadedFile.originalName}</p>
                    <p>Upload ID: {uploadedFile.id}</p>
                    <p>Size: {uploadedFile.size} bytes</p>
                </div>
            )}
        </section>
    );
}

export default FileUpload;
