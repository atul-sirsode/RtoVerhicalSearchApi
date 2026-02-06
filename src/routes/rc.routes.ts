import { Router } from "express"
import { fetchRC } from "../controllers/rc.controller.js"

const router = Router()

router.post("/rc_verify", fetchRC)

export default router