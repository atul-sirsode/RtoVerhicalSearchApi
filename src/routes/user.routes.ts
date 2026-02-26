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

const router = Router();

/**
 * User Management Routes
 */

// Existing routes
router.post("/login", login);
router.post("/get-user-info", getUserInfo);
router.post("/get-user-permissions", getUserPermissions);
router.get("/get-all-active-users", getAllActiveUsers);

// ==================== USER CRUD ROUTES ====================
router.post("/create", createUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);

export default router;
