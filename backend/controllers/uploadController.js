
const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { randomUUID } = require("crypto");
const path = require("path");

const s3 = require("../config/s3");
const { pool } = require("../config/db");

// Upload file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const safeName = path.basename(req.file.originalname)
            .replace(/[^a-zA-Z0-9._-]/g, "_");

        const s3Key = `uploads/${randomUUID()}-${safeName}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const [result] = await pool.query(
            `INSERT INTO uploads
            (original_name, s3_key, content_type, size_bytes)
            VALUES (?, ?, ?, ?)`,
            [req.file.originalname, s3Key, req.file.mimetype, req.file.size]
        );

        res.status(201).json({
            message: "File uploaded successfully",
            upload: {
                id: result.insertId,
                originalName: req.file.originalname,
                s3Key,
                size: req.file.size
            }
        });

    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ message: "File upload failed" });
    }
};

// List files
const getFiles = async (req, res) => {
    try {
        const [files] = await pool.query(
            `SELECT id, original_name, content_type,
                    size_bytes, created_at
             FROM uploads ORDER BY created_at DESC`
        );

        res.json({ files });
    } catch (error) {
        console.error("List files error:", error.message);
        res.status(500).json({ message: "Unable to retrieve files" });
    }
};

// Generate secure download URL
const downloadFile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT original_name, s3_key FROM uploads WHERE id = ?",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "File not found" });
        }

        const file = rows[0];

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: file.s3_key,
            ResponseContentDisposition:
                `attachment; filename="${path.basename(file.original_name).replace(/["\\]/g, "_")}"`
        });

        const downloadUrl = await getSignedUrl(s3, command, {
            expiresIn: 300
        });

        res.json({ downloadUrl, expiresIn: 300 });

    } catch (error) {
        console.error("Download error:", error.message);
        res.status(500).json({ message: "Unable to generate download URL" });
    }
};

// Delete file
const deleteFile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT s3_key FROM uploads WHERE id = ?",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "File not found" });
        }

        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: rows[0].s3_key
        }));

        await pool.query(
            "DELETE FROM uploads WHERE id = ?",
            [req.params.id]
        );

        res.json({ message: "File deleted successfully" });

    } catch (error) {
        console.error("Delete error:", error.message);
        res.status(500).json({ message: "Unable to delete file" });
    }
};

module.exports = {
    uploadFile,
    getFiles,
    downloadFile,
    deleteFile
};
