import type { Request, Response, NextFunction } from "express";
import { LightweightTollGuruService } from "../services/lightweight-tollguru.service.js";
import type { TollGuruRequest } from "../types/tollguru.types.js";

// Lightweight request interface - excludes includeAnalysis and analysisOptions
interface LightweightTollGuruRequest {
  from: {
    address: string;
  };
  to: {
    address: string;
  };
  vehicle: {
    type: string;
  };
  country: string;
  departureTime?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LightweightTollGuruRequest:
 *       type: object
 *       required:
 *         - from
 *         - to
 *         - vehicle
 *         - country
 *       properties:
 *         from:
 *           $ref: '#/components/schemas/TollGuruLocation'
 *         to:
 *           $ref: '#/components/schemas/TollGuruLocation'
 *         vehicle:
 *           $ref: '#/components/schemas/TollGuruVehicle'
 *         country:
 *           type: string
 *           description: 3-letter ISO country code
 *           example: "IND"
 *           pattern: "^[A-Z]{3}$"
 *         departureTime:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 formatted departure time (optional, defaults to current time)
 *           example: "2026-03-06T16:13:00.000Z"
 *     LightweightTollGuruResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Toll details retrieved successfully"
 *         statuscode:
 *           type: integer
 *           example: 200
 *         analysis:
 *           type: object
 *           properties:
 *             recommendedRoute:
 *               type: object
 *               description: Recommended route with full toll details and analysis
 */

/**
 * @swagger
 * /api/lightweight-tollguru/get-toll-details:
 *   post:
 *     summary: Get toll details with only recommended route (lightweight version)
 *     description: Returns only the recommended route analysis without alternative routes
 *     tags: [Lightweight TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LightweightTollGuruRequest'
 *     responses:
 *       200:
 *         description: Toll details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LightweightTollGuruResponse'
 *       400:
 *         description: Bad request - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
export async function getTollDetails(
  req: Request<{}, {}, LightweightTollGuruRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const tollRequest = req.body;

    // Convert to TollGuruRequest format for the service
    const serviceRequest: TollGuruRequest = {
      from: tollRequest.from,
      to: tollRequest.to,
      vehicle: tollRequest.vehicle,
      country: tollRequest.country,
    };

    // Add departureTime only if it exists
    if (tollRequest.departureTime) {
      serviceRequest.departureTime = tollRequest.departureTime;
    }

    const lightweightService = new LightweightTollGuruService();
    const result = await lightweightService.getTollDetails(serviceRequest);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in Lightweight TollGuru controller:", err);
    next(err);
  }
}
