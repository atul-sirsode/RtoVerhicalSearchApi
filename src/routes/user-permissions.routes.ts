import { Router } from "express";
import {
  getAllUserPermissions,
  getUserPermissionsByUserId,
  createUserPermission,
  updateUserPermission,
  deleteUserPermission,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * User Permissions Management Routes
 */

// Get all user permissions
router.get("/", getAllUserPermissions);

// Get user permissions by user_id
router.get("/:user_id", getUserPermissionsByUserId);

// Create user permission
router.post("/create", createUserPermission);

// Update user permission
router.put("/update", updateUserPermission);

// Delete user permission
router.delete("/delete", deleteUserPermission);

export default router;
