import { Router } from "express";
import {
  getAllBanks,
  createBank,
  updateBank,
  deleteBank,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * Bank Management Routes
 */

// Get all banks (no restriction - GET allowed for all)
router.get("/", getAllBanks);

// Create bank (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createBank);

// Update bank (restricted - guests cannot update)
router.put("/update", guestRestrictionMiddleware, updateBank);

// Delete bank (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deleteBank);

export default router;
