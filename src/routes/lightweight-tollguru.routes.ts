import { Router } from "express";
import { getTollDetails } from "../controllers/lightweight-tollguru.controller.js";

const router = Router();

/**
 * Lightweight TollGuru Routes
 */
router.post("/get-toll-details", getTollDetails);

export default router;
