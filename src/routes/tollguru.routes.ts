import { Router } from "express";
import {
  getTollInfo,
  getVehicleTypes,
  getVehicleDescription,
} from "../controllers/tollguru.controller.js";

const router = Router();

/**
 * TollGuru Routes
 */
router.post("/get-toll-info", getTollInfo);
router.get("/vehicle-types", getVehicleTypes);
router.post("/vehicle-description", getVehicleDescription);

export default router;
