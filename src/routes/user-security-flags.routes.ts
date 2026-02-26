import { Router } from "express";
import {
  getAllUserSecurityFlags,
  createUserSecurityFlag,
  updateUserSecurityFlag,
  deleteUserSecurityFlag,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * User Security Flags Management Routes
 */

// Get all user security flags
router.get("/", getAllUserSecurityFlags);

// Create user security flag
router.post("/create", createUserSecurityFlag);

// Update user security flag
router.put("/update", updateUserSecurityFlag);

// Delete user security flag
router.delete("/delete", deleteUserSecurityFlag);

export default router;
