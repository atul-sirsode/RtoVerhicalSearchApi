import { Router } from "express"
import { fetchRCV1 } from "../controllers/rc.controller.js"

const router = Router()

// V1 endpoint - no caching
router.post("/rc_verify", fetchRCV1)

export default router
