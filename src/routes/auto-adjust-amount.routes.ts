import { Router } from "express";
import {
  getAllAutoAdjustAmounts,
  getAutoAdjustAmount,
  createAutoAdjustAmount,
  updateAutoAdjustAmount,
  deleteAutoAdjustAmount,
} from "../controllers/auto-adjust-amount.controller.js";

const router = Router();

/**
 * Auto Adjust Amount Routes
 * CRUD operations for auto_adjust_amount table
 */

// GET all auto adjust amounts
router.get("/", getAllAutoAdjustAmounts);

// GET auto adjust amount by ID
router.get("/:id", getAutoAdjustAmount);

// POST create new auto adjust amount
router.post("/", createAutoAdjustAmount);

// PUT update auto adjust amount by ID
router.put("/:id", updateAutoAdjustAmount);

// DELETE auto adjust amount by ID
router.delete("/:id", deleteAutoAdjustAmount);

export default router;
