import { Router } from "express";
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * Permission Management Routes
 */

// Get all permissions
router.get("/", getAllPermissions);

// Create permission
router.post("/create", createPermission);

// Update permission
router.put("/update", updatePermission);

// Delete permission
router.delete("/delete", deletePermission);

export default router;
