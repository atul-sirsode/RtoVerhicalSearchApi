import type { Request, Response, NextFunction } from "express";
import { proxyRequest } from "../services/proxy.service.js";
import { env } from "../config/env.js";
import { RCDetailsService } from "../services/rc-details.service.js";
import type {
  RcDetails,
  RCApiResponse,
  ApiErrorResponse,
} from "../types/types/auth.types.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     RcDetails:
 *       type: object
 *       required:
 *         - id_number
 *       properties:
 *         id_number:
 *           type: string
 *           description: RTO vehicle registration number
 *           example: "MH12AB1234"
 *     RCApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           description: Vehicle details
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Missing Authorization header"
 *         statuscode:
 *           type: integer
 *           example: 401
 */

/**
 * @swagger
 * /api/rc/rc_verify:
 *   post:
 *     summary: Get vehicle RC details by registration number (v1 - no caching)
 *     tags: [RC Verification]
 *     security:
 *       - jwtAuth: []
 *       - partnerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RcDetails'
 *     responses:
 *       200:
 *         description: RC details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RCApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Missing or invalid authorization token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rc/rc_verify:
 *   post:
 *     summary: Get vehicle RC details by registration number (v1 - no caching)
 *     tags: [RC Verification]
 *     security:
 *       - jwtAuth: []
 *       - partnerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RcDetails'
 *     responses:
 *       200:
 *         description: RC details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RCApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Missing or invalid authorization token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v2/rc/rc_verify:
 *   post:
 *     summary: Get vehicle RC details by registration number (v2 - with caching)
 *     tags: [RC Verification]
 *     security:
 *       - jwtAuth: []
 *       - partnerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RcDetails'
 *     responses:
 *       200:
 *         description: RC details retrieved successfully (from cache or API)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RCApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Missing or invalid authorization token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */

// V1 Handler - Original implementation without caching
export async function fetchRC(
  req: Request<{}, {}, RcDetails>,
  res: Response<RCApiResponse | ApiErrorResponse>,
  next: NextFunction,
) {
  try {
    const token = req.headers.token;
    const partnerId = req.headers.partnerid;
    const authHeader = req.headers.authorization;
    if (!authHeader || !token) {
      const errorResponse: ApiErrorResponse = {
        status: false,
        message: "Missing Authorization header (JWT token)",
        statuscode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    if (!partnerId) {
      const errorResponse: ApiErrorResponse = {
        status: false,
        message: "Missing PartnerId header",
        statuscode: 401,
      };
      return res.status(401).json(errorResponse);
    }
    const Token = token ?? authHeader;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Token: Token as string,
      PartnerId: (Array.isArray(partnerId)
        ? partnerId[0]
        : partnerId) as string,
    };

    if (partnerId) {
      requestHeaders["User-Agent"] = (
        Array.isArray(partnerId) ? partnerId[0] : partnerId
      ) as string;
    }

    const data = await proxyRequest<RCApiResponse>({
      url: `${env.API_BASE}/${env.RC_DETAILS_URL}`,
      method: "POST",
      data: req.body,
      headers: requestHeaders,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// V1 Handler - Alias for backward compatibility
export async function fetchRCV1(
  req: Request<{}, {}, RcDetails>,
  res: Response<RCApiResponse | ApiErrorResponse>,
  next: NextFunction,
) {
  return fetchRC(req, res, next);
}

// V2 Handler - New implementation with caching
export async function fetchRCV2(
  req: Request<{}, {}, RcDetails>,
  res: Response<RCApiResponse | ApiErrorResponse>,
  next: NextFunction,
) {
  try {
    const token = req.headers.token;
    const authHeader = req.headers.authorization;
    const partnerId = req.headers.partnerid;

    if (!authHeader && !token) {
      const errorResponse: ApiErrorResponse = {
        status: false,
        message: "Missing Authorization header (JWT token)",
        statuscode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    if (!partnerId) {
      const errorResponse: ApiErrorResponse = {
        status: false,
        message: "Missing PartnerId header",
        statuscode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    const rcDetailsService = new RCDetailsService();
    const rcNumber = req.body.id_number;

    // First, try to get from cache
    const cachedData = await rcDetailsService.getRCDetails(rcNumber);

    if (cachedData) {
      return res.json(cachedData);
    }

    const Token = token ?? authHeader;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Token: Token as string,
      PartnerId: (Array.isArray(partnerId)
        ? partnerId[0]
        : partnerId) as string,
    };

    if (partnerId) {
      requestHeaders["User-Agent"] = (
        Array.isArray(partnerId) ? partnerId[0] : partnerId
      ) as string;
    }

    const data = await proxyRequest<RCApiResponse>({
      url: `${env.API_BASE}/${env.RC_DETAILS_URL}`,
      method: "POST",
      data: req.body,
      headers: requestHeaders,
    });

    console.log("API Response Data", data);

    // If API call was successful, save to cache
    if (data.status && data.data) {
      console.log("Saving RC details to cache for number:", rcNumber);
      await rcDetailsService.saveRCDetails(data);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}
