import { Router } from "express";
import {
  getAllUserPermissions,
  getUserPermissionsByUserId,
  createUserPermission,
  updateUserPermission,
  deleteUserPermission,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * User Permissions Management Routes
 */

// Get all user permissions (no restriction - GET allowed for all)
router.get("/", getAllUserPermissions);

// Get user permissions by user_id (no restriction - GET allowed for all)
router.get("/:user_id", getUserPermissionsByUserId);

// Create user permission (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createUserPermission);

// Update user permission (restricted - guests cannot update)
router.put("/update", guestRestrictionMiddleware, updateUserPermission);

// Delete user permission (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deleteUserPermission);

export default router;
