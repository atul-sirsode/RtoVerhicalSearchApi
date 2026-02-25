import { Router } from "express";
import {
  getStates,
  getCitiesByState,
  getStats,
} from "../controllers/states-cities.controller.js";

const router = Router();

/**
 * States & Cities Routes
 */
router.get("/get-states", getStates);
router.get("/get-city-by-state", getCitiesByState);
router.get("/stats", getStats);

export default router;
