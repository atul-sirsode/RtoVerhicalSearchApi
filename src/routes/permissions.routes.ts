import { Router } from "express";
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * Permission Management Routes
 */

// Get all permissions (no restriction - GET allowed for all)
router.get("/", getAllPermissions);

// Create permission (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createPermission);

// Update permission (restricted - guests cannot update)
router.put("/update", guestRestrictionMiddleware, updatePermission);

// Delete permission (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deletePermission);

export default router;
