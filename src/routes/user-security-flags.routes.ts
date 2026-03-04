import { Router } from "express";
import {
  getAllUserSecurityFlags,
  getUserSecurityFlagByUserId,
  createUserSecurityFlag,
  updateUserSecurityFlag,
  deleteUserSecurityFlag,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * User Security Flags Management Routes
 */

// Get all user security flags (no restriction - GET allowed for all)
router.get("/", getAllUserSecurityFlags);

// Get user security flag by user_id (no restriction - GET allowed for all)
router.get("/:user_id", getUserSecurityFlagByUserId);

// Create user security flag (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createUserSecurityFlag);

// Update user security flag (restricted - guests cannot update)
router.put("/update", guestRestrictionMiddleware, updateUserSecurityFlag);

// Delete user security flag (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deleteUserSecurityFlag);

export default router;
