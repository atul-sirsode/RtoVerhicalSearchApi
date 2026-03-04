import { Router } from "express";
import {
  getAllUserRoles,
  createUserRole,
  deleteUserRole,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * User Roles Management Routes
 */

// Get all user roles (no restriction - GET allowed for all)
router.get("/", getAllUserRoles);

// Create user role (restricted - guests cannot create)
router.post("/create", guestRestrictionMiddleware, createUserRole);

// Delete user role (restricted - guests cannot delete)
router.delete("/delete", guestRestrictionMiddleware, deleteUserRole);

export default router;
