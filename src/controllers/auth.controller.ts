import type { Request, Response, NextFunction } from "express"
import { proxyRequest } from "../services/proxy.service.js"
import { env } from "../config/env.js"

import type {
    LoginDetails,
    LoginOTPResponse, VerifyOtp, VerifyOTPResponse
} from "../types/types/auth.types.js"

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDetails:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username for login
 *           example: "user123"
 *         password:
 *           type: string
 *           description: Password for login
 *           example: "password123"
 *     LoginOTPResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         message:
 *           type: string
 *         session_id:
 *           type: string
 *     VerifyOtp:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - otp
 *       properties:
 *         username:
 *           type: string
 *           description: Username for verification
 *           example: "user123"
 *         password:
 *           type: string
 *           description: Password for verification
 *           example: "password123"
 *         otp:
 *           type: string
 *           description: One-time password
 *           example: "123456"
 *     VerifyOTPResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/login_otp:
 *   post:
 *     summary: Send login OTP to mobile number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDetails'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginOTPResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export async function login(
    req: Request<{}, {}, LoginDetails>,
    res: Response<LoginOTPResponse>,
    next: NextFunction
) {
    try {
        console.log("requestBody", req.body)

        const requestHeaders = {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
        }

        const data = await proxyRequest<LoginOTPResponse>({
            url: `${env.API_BASE}/${env.LOGIN_OTP_URL}`,
            method: "POST",
            data: req.body,
            headers: requestHeaders
        })

        res.json(data)
    } catch (err) {
        next(err)
    }
}



/**
 * @swagger
 * /api/auth/login_verify_otp:
 *   post:
 *     summary: Verify login OTP and get authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOTPResponse'
 *       400:
 *         description: Invalid OTP or bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function VerifyLogin(
    req: Request<{}, {}, VerifyOtp>,
    res: Response<VerifyOTPResponse>,
    next: NextFunction
) {
    try {
        console.log("requestBody", req.body)

        const requestHeaders = {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
        }

        const data = await proxyRequest<VerifyOTPResponse>({
            url: `${env.API_BASE}/${env.VERIFY_OTP_URL}`,
            method: "POST",
            data: req.body,
            headers: requestHeaders
        })

        res.json(data)
    } catch (err) {
        next(err)
    }
}