import { Router } from "express";
import { fetchRCV2 } from "../controllers/rc.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

// V2 endpoint - with caching
// Authentication required - only guests (is_guest=1) are restricted
router.post("/rc_verify", guestRestrictionMiddleware, fetchRCV2);

export default router;
