import { Router } from "express";
import { fetchRC, fetchRCV1, fetchRCV2 } from "../controllers/rc.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

// Original endpoint - points to v1 (no caching)
// Authentication required - only guests (is_guest=1) are restricted
router.post("/rc_verify", guestRestrictionMiddleware, fetchRC);

export default router;
