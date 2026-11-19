
const express = require("express");
const multer = require("multer");

const {
    uploadFile,
    getFiles,
    downloadFile,
    deleteFile
} = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 40 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "text/plain"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"));
        }
    }
});

router.get("/", getFiles);
router.get("/:id/download", downloadFile);
router.post("/", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

module.exports = router;
