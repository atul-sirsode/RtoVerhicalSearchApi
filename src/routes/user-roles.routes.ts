import { Router } from "express";
import {
  getAllUserRoles,
  createUserRole,
  deleteUserRole,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * User Roles Management Routes
 */

// Get all user roles
router.get("/", getAllUserRoles);

// Create user role
router.post("/create", createUserRole);

// Delete user role
router.delete("/delete", deleteUserRole);

export default router;
