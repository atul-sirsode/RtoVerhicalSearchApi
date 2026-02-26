import { Router } from "express";
import {
  getAllBanks,
  createBank,
  updateBank,
  deleteBank,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * Bank Management Routes
 */

// Get all banks
router.get("/", getAllBanks);

// Create bank
router.post("/create", createBank);

// Update bank
router.put("/update", updateBank);

// Delete bank
router.delete("/delete", deleteBank);

export default router;
