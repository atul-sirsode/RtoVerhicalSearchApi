import { Router } from "express";
import { fetchRC, fetchRCV1, fetchRCV2 } from "../controllers/rc.controller.js";

const router = Router();

// Original endpoint - points to v1 (no caching)
router.post("/rc_verify", fetchRC);

export default router;
