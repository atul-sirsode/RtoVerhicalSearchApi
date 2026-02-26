import { Router } from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * Role Management Routes
 */

// Get all roles
router.get("/", getAllRoles);

// Create role
router.post("/create", createRole);

// Update role
router.put("/update", updateRole);

// Delete role
router.delete("/delete", deleteRole);

export default router;
