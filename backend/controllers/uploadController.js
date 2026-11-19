const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");
const path = require("path");

const s3 = require("../config/s3");
const { pool } = require("../config/db");

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
            [
                req.file.originalname,
                s3Key,
                req.file.mimetype,
                req.file.size
            ]
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

module.exports = { uploadFile };
