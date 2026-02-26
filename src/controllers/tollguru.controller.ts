import type { Request, Response, NextFunction } from "express";
import { TollGuruService } from "../services/tollguru.service.js";
import type {
  TollGuruRequest,
  TollGuruApiResponse,
  TollGuruLocation,
  TollGuruVehicle,
} from "../types/tollguru.types.js";
import type { TollCalculationOptions } from "../types/toll-analysis.types.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     TollCalculationOptions:
 *       type: object
 *       properties:
 *         includeFuelCost:
 *           type: boolean
 *           description: Include fuel cost in total calculations
 *           default: true
 *         includeCashCosts:
 *           type: boolean
 *           description: Include cash toll costs in analysis
 *           default: true
 *         calculateAverageSpeeds:
 *           type: boolean
 *           description: Calculate average speeds between tolls
 *           default: true
 *         formatTimeDisplay:
 *           type: boolean
 *           description: Format time displays for better readability
 *           default: true
 *     TollGuruLocation:
 *       type: object
 *       required:
 *         - address
 *       properties:
 *         address:
 *           type: string
 *           description: Address string
 *           example: "Nagpur, maharashtra"
 *     TollGuruVehicle:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           description: Vehicle type
 *           example: "2AxlesAuto"
 *           enum:
 *             - 2AxlesAuto
 *             - 2AxlesMotorcycle
 *             - 3AxlesAuto
 *             - 3AxlesAutoPlusTrailer
 *             - 4AxlesAuto
 *             - 4AxlesAutoPlusTrailer
 *             - 5AxlesAuto
 *             - 5AxlesAutoPlusTrailer
 *             - 6AxlesAuto
 *             - 6AxlesAutoPlusTrailer
 *             - 7AxlesAuto
 *             - 7AxlesAutoPlusTrailer
 *             - 8AxlesAuto
 *             - 8AxlesAutoPlusTrailer
 *     TollGuruRequest:
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
 *         includeAnalysis:
 *           type: boolean
 *           description: Include detailed toll analysis in response
 *           default: false
 *         analysisOptions:
 *           $ref: '#/components/schemas/TollCalculationOptions'
 *     TollGuruApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Toll information retrieved successfully"
 *         data:
 *           type: object
 *           description: TollGuru API response data
 *         analysis:
 *           type: object
 *           description: Detailed toll analysis data
 *           properties:
 *             recommendedRoute:
 *               type: object
 *               description: Recommended route with full analysis
 *             alternativeRoutes:
 *               type: array
 *               items:
 *                 type: object
 *               description: Alternative routes with analysis
 *             routeComparison:
 *               type: object
 *               description: Comparison between cheapest, fastest, and practical routes
 *             tollStatistics:
 *               type: object
 *               description: Statistical analysis of tolls
 *             analysisTimestamp:
 *               type: string
 *               format: date-time
 *               description: When the analysis was performed
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Origin address is required"
 *         statuscode:
 *           type: integer
 *           example: 400
 */

/**
 * @swagger
 * /api/tollguru/get-toll-info:
 *   post:
 *     summary: Get toll information between origin and destination
 *     tags: [TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TollGuruRequest'
 *     responses:
 *       200:
 *         description: Toll information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TollGuruApiResponse'
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
export async function getTollInfo(
  req: Request<
    {},
    {},
    TollGuruRequest & {
      includeAnalysis?: boolean;
      analysisOptions?: TollCalculationOptions;
    }
  >,
  res: Response<TollGuruApiResponse>,
  next: NextFunction,
) {
  try {
    console.log("TollGuru request body:", req.body);

    const { includeAnalysis, analysisOptions, ...tollRequest } = req.body;

    const tollGuruService = new TollGuruService();
    const result = await tollGuruService.getTollInfo(tollRequest, {
      includeAnalysis: includeAnalysis || false,
      analysisOptions: analysisOptions || {
        includeFuelCost: true,
        includeCashCosts: true,
        calculateAverageSpeeds: true,
        formatTimeDisplay: true,
      },
    });

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in TollGuru controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/tollguru/vehicle-types:
 *   get:
 *     summary: Get supported vehicle types
 *     tags: [TollGuru]
 *     responses:
 *       200:
 *         description: Supported vehicle types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Vehicle types retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "2AxlesAuto"
 *                     - "2AxlesMotorcycle"
 *                     - "3AxlesAuto"
 *       500:
 *         description: Internal server error
 */
export async function getVehicleTypes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tollGuruService = new TollGuruService();
    const vehicleTypes = tollGuruService.getSupportedVehicleTypes();

    const response = {
      status: true,
      message: "Vehicle types retrieved successfully",
      data: vehicleTypes,
    };

    res.json(response);
  } catch (err) {
    console.error("Error getting vehicle types:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/tollguru/vehicle-description:
 *   post:
 *     summary: Get vehicle description for a given vehicle type
 *     tags: [TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleType
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 description: Vehicle type
 *                 example: "2AxlesAuto"
 *     responses:
 *       200:
 *         description: Vehicle description retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Vehicle description retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicleType:
 *                       type: string
 *                       example: "2AxlesAuto"
 *                     description:
 *                       type: string
 *                       example: "Car, Jeep, Van, SUV"
 *       400:
 *         description: Bad request - invalid vehicle type
 *       500:
 *         description: Internal server error
 */
export async function getVehicleDescription(
  req: Request<{}, {}, { vehicleType: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { vehicleType } = req.body;

    if (!vehicleType) {
      const errorResponse = {
        status: false,
        message: "Vehicle type is required",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const tollGuruService = new TollGuruService();
    const description = tollGuruService.getVehicleDescription(vehicleType);

    const response = {
      status: true,
      message: "Vehicle description retrieved successfully",
      data: {
        vehicleType,
        description,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error getting vehicle description:", err);
    next(err);
  }
}
