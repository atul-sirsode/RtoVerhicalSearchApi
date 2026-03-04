import { Router } from "express";
import {
  login,
  getUserInfo,
  getUserPermissions,
  getAllActiveUsers,
  // User CRUD
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

/**
 * User Management Routes
 */

// Existing routes (no restrictions - these are GET/POST for info retrieval)
router.post("/login", login);
router.post("/get-user-info", getUserInfo);
router.post("/get-user-permissions", getUserPermissions);
router.get("/get-all-active-users", getAllActiveUsers);

// ==================== USER CRUD ROUTES ====================
// Create user (restricted - guests cannot create users)
router.post("/create", guestRestrictionMiddleware, createUser);

// Update user (restricted - guests cannot update users)
router.put("/update", guestRestrictionMiddleware, updateUser);

// Delete user (restricted - guests cannot delete users)
router.delete("/delete", guestRestrictionMiddleware, deleteUser);

export default router;
