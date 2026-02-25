import { Router } from "express"
import { fetchRCV2 } from "../controllers/rc.controller.js"

const router = Router()

// V2 endpoint - with caching
router.post("/rc_verify", fetchRCV2)

export default router
