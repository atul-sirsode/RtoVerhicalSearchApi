import { Router } from "express";
import {
  getStates,
  getCitiesByState,
  getStats,
  insertCity,
  deleteCity,
} from "../controllers/states-cities.controller.js";

const router = Router();

/**
 * States & Cities Routes
 */
router.get("/get-states", getStates);
router.get("/get-city-by-state", getCitiesByState);
router.get("/stats", getStats);
router.post("/insert-city", insertCity);
router.delete("/delete-city", deleteCity);

export default router;
