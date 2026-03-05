import { Router } from "express";
import { fetchRCV1 } from "../controllers/rc.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

// V1 endpoint - no caching
// Authentication required - only guests (is_guest=1) are restricted
router.post("/rc_verify", guestRestrictionMiddleware, fetchRCV1);

export default router;
