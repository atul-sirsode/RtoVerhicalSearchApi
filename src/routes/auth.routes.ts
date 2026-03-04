import { Router } from "express";
import { login, VerifyLogin } from "../controllers/auth.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();

// Auth endpoints (restricted for guests)
router.post("/login_otp", guestRestrictionMiddleware, login);
router.post("/login_verify_otp", guestRestrictionMiddleware, VerifyLogin);
export default router;
