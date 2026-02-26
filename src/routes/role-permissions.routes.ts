import { Router } from "express";
import {
  getAllRolePermissions,
  getRolePermissionsByUserId,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * Role Permissions Management Routes
 */

// Get all role permissions
router.get("/", getAllRolePermissions);

// Get role permissions by user_id
router.get("/user/:user_id", getRolePermissionsByUserId);

// Create role permission
router.post("/create", createRolePermission);

// Update role permission
router.put("/update", updateRolePermission);

// Delete role permission
router.delete("/delete", deleteRolePermission);

export default router;
