import { Router } from "express";
import {
  getAllRolePermissions,
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

// Create role permission
router.post("/create", createRolePermission);

// Update role permission
router.put("/update", updateRolePermission);

// Delete role permission
router.delete("/delete", deleteRolePermission);

export default router;
