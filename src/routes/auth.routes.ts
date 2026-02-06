import { Router } from "express"
import { login, VerifyLogin } from "../controllers/auth.controller.js"

const router = Router()

router.post("/login_otp", login)
router.post("/login_verify_otp", VerifyLogin)
export default router