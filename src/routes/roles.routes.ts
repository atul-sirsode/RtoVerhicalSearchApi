import { Router } from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * Role Management Routes
 */

// Get all roles (no restriction - GET allowed for all)
router.get("/", getAllRoles);

// Create role (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createRole);

// Update role (restricted - guests cannot update)
router.put("/update", guestRestrictionMiddleware, updateRole);

// Delete role (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deleteRole);

export default router;
