import { Router } from "express";
import multer from "multer";
import {
  getFileHistory,
  saveFileToHistory,
  getFileBlob,
  deleteFileFromHistory,
  searchFilesByName,
  getFileHistoryStats,
} from "../controllers/file-history.controller.js";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel and CSV files
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/csv", // .csv
    ];

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.originalname
      ?.toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (
      allowedTypes.includes(file.mimetype) ||
      (fileExtension && allowedExtensions.includes(fileExtension))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) and CSV files are allowed"));
    }
  },
});

// GET /api/file-history - Get file history with pagination
router.get("/", getFileHistory);

// POST /api/file-history - Save file to history
router.post("/", upload.single("file"), saveFileToHistory);

// GET /api/file-history/search - Search files by name
router.get("/search", searchFilesByName);

// GET /api/file-history/stats - Get file history statistics
router.get("/stats", getFileHistoryStats);

// GET /api/file-history/:id - Get file blob by ID
router.get("/:id", getFileBlob);

// DELETE /api/file-history/:id - Delete file from history
router.delete("/:id", deleteFileFromHistory);

export default router;
