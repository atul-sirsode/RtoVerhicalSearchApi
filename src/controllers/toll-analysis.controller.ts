import type { Request, Response, NextFunction } from "express";
import { TollAnalysisService } from "../services/toll-analysis.service.js";
import type {
  EnhancedTollGuruRequest,
  EnhancedTollGuruResponse,
  TollCalculationOptions,
} from "../types/toll-analysis.types.js";

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
 *     EnhancedTollGuruRequest:
 *       type: object
 *       required:
 *         - from
 *         - to
 *         - vehicle
 *         - country
 *       properties:
 *         from:
 *           type: object
 *           required:
 *             - address
 *           properties:
 *             address:
 *               type: string
 *               description: Origin address
 *               example: "Nagpur, maharashtra"
 *         to:
 *           type: object
 *           required:
 *             - address
 *           properties:
 *             address:
 *               type: string
 *               description: Destination address
 *               example: "Hyderabad, andra_predesh"
 *         vehicle:
 *           type: object
 *           required:
 *             - type
 *           properties:
 *             type:
 *               type: string
 *               description: Vehicle type
 *               example: "2AxlesAuto"
 *               enum:
 *                 - 2AxlesAuto
 *                 - 2AxlesMotorcycle
 *                 - 3AxlesAuto
 *                 - 3AxlesAutoPlusTrailer
 *                 - 4AxlesAuto
 *                 - 4AxlesAutoPlusTrailer
 *                 - 5AxlesAuto
 *                 - 5AxlesAutoPlusTrailer
 *                 - 6AxlesAuto
 *                 - 6AxlesAutoPlusTrailer
 *                 - 7AxlesAuto
 *                 - 7AxlesAutoPlusTrailer
 *                 - 8AxlesAuto
 *                 - 8AxlesAutoPlusTrailer
 *         country:
 *           type: string
 *           description: 3-letter ISO country code
 *           example: "IND"
 *           pattern: "^[A-Z]{3}$"
 *         departureTime:
 *           type: string
 *           description: Optional departure time for calculations
 *           example: "2026-02-26T10:00:00Z"
 *     TollAnalysisResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Toll analysis completed successfully"
 *         data:
 *           type: object
 *           description: Comprehensive toll analysis data
 *           properties:
 *             origin:
 *               type: string
 *               example: "Nagpur, maharashtra"
 *             destination:
 *               type: string
 *               example: "Hyderabad, andra_predesh"
 *             vehicleType:
 *               type: string
 *               example: "2AxlesAuto"
 *             currency:
 *               type: string
 *               example: "INR"
 *             totalRoutes:
 *               type: integer
 *               example: 3
 *             recommendedRoute:
 *               type: object
 *               description: Recommended route based on criteria
 *             alternativeRoutes:
 *               type: array
 *               items:
 *                 type: object
 *               description: Alternative routes
 *             analysisTimestamp:
 *               type: string
 *               format: date-time
 *               description: When the analysis was performed
 */

/**
 * @swagger
 * /api/tollguru/analyze-tolls:
 *   post:
 *     summary: Get comprehensive toll analysis with arrival time calculations
 *     tags: [TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/EnhancedTollGuruRequest'
 *               - type: object
 *                 properties:
 *                   options:
 *                     $ref: '#/components/schemas/TollCalculationOptions'
 *     responses:
 *       200:
 *         description: Toll analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TollAnalysisResponse'
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
export async function analyzeTolls(
  req: Request<
    {},
    {},
    EnhancedTollGuruRequest & { options?: TollCalculationOptions }
  >,
  res: Response<EnhancedTollGuruResponse>,
  next: NextFunction,
) {
  try {
    const { options, ...tollRequest } = req.body;

    const tollAnalysisService = new TollAnalysisService();
    const result = await tollAnalysisService.getTollAnalysis(
      tollRequest,
      options,
    );

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in toll analysis controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/tollguru/compare-routes:
 *   post:
 *     summary: Compare routes based on different criteria (cheapest, fastest, practical)
 *     tags: [TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhancedTollGuruRequest'
 *     responses:
 *       200:
 *         description: Route comparison completed successfully
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
 *                   example: "Route comparison completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cheapestRoute:
 *                       type: object
 *                       description: Route with lowest total cost
 *                     fastestRoute:
 *                       type: object
 *                       description: Route with shortest duration
 *                     practicalRoute:
 *                       type: object
 *                       description: Most practical route
 *                     routeComparison:
 *                       type: object
 *                       properties:
 *                         cheapest:
 *                           type: object
 *                           properties:
 *                             cost:
 *                               type: number
 *                             duration:
 *                               type: string
 *                             tollCount:
 *                               type: integer
 *                         fastest:
 *                           type: object
 *                           properties:
 *                             cost:
 *                               type: number
 *                             duration:
 *                               type: string
 *                             tollCount:
 *                               type: integer
 *                         practical:
 *                           type: object
 *                           properties:
 *                             cost:
 *                               type: number
 *                             duration:
 *                               type: string
 *                             tollCount:
 *                               type: integer
 *       400:
 *         description: Bad request - invalid input data
 *       500:
 *         description: Internal server error
 */
export async function compareRoutes(
  req: Request<{}, {}, EnhancedTollGuruRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const tollAnalysisService = new TollAnalysisService();

    // First get the toll analysis
    const analysisResult = await tollAnalysisService.getTollAnalysis(req.body);

    if (!analysisResult.status || !analysisResult.data) {
      const statusCode = analysisResult.statuscode || 500;
      return res.status(statusCode).json(analysisResult);
    }

    // Then compare the routes
    const comparisonResult = tollAnalysisService.compareRoutes(
      analysisResult.data,
    );

    const response = {
      status: true,
      message: "Route comparison completed successfully",
      data: comparisonResult,
    };

    res.json(response);
  } catch (err) {
    console.error("Error in route comparison controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/tollguru/toll-statistics:
 *   post:
 *     summary: Get detailed toll statistics for a specific route
 *     tags: [TollGuru]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routeIndex
 *             properties:
 *               routeIndex:
 *                 type: integer
 *                 description: Index of the route to analyze (0-based)
 *                 example: 0
 *               tollRequest:
 *                 $ref: '#/components/schemas/EnhancedTollGuruRequest'
 *     responses:
 *       200:
 *         description: Toll statistics retrieved successfully
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
 *                   example: "Toll statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTolls:
 *                       type: integer
 *                       example: 11
 *                     totalCost:
 *                       type: number
 *                       example: 681
 *                     averageTollCost:
 *                       type: number
 *                       example: 61.91
 *                     mostExpensiveToll:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Borkhedi (Nagpur Bypass)"
 *                         tagCost:
 *                           type: number
 *                           example: 155
 *                     cheapestToll:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Arambha"
 *                         tagCost:
 *                           type: number
 *                           example: 0
 *                     averageTimeBetweenTolls:
 *                       type: number
 *                       example: 3675
 *       400:
 *         description: Bad request - invalid route index
 *       500:
 *         description: Internal server error
 */
export async function getTollStatistics(
  req: Request<
    {},
    {},
    { routeIndex: number; tollRequest: EnhancedTollGuruRequest }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { routeIndex, tollRequest } = req.body;

    if (typeof routeIndex !== "number" || routeIndex < 0) {
      const errorResponse = {
        status: false,
        message: "Valid route index is required",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    console.log("Toll statistics request for route:", routeIndex);

    const tollAnalysisService = new TollAnalysisService();

    // First get the toll analysis
    const analysisResult =
      await tollAnalysisService.getTollAnalysis(tollRequest);

    if (!analysisResult.status || !analysisResult.data) {
      const statusCode = analysisResult.statuscode || 500;
      return res.status(statusCode).json(analysisResult);
    }

    // Get all routes
    const allRoutes = [
      analysisResult.data.recommendedRoute,
      ...analysisResult.data.alternativeRoutes,
    ];

    // Check if route index is valid
    if (routeIndex >= allRoutes.length) {
      const errorResponse = {
        status: false,
        message: `Route index ${routeIndex} is out of range. Available routes: 0-${allRoutes.length - 1}`,
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    // Get statistics for the requested route
    const targetRoute = allRoutes[routeIndex];
    if (!targetRoute) {
      const errorResponse = {
        status: false,
        message: `Route ${routeIndex} not found`,
        statuscode: 404,
      };
      return res.status(404).json(errorResponse);
    }

    const statistics = tollAnalysisService.getTollStatistics(targetRoute);

    const response = {
      status: true,
      message: "Toll statistics retrieved successfully",
      data: {
        routeIndex,
        routeName: targetRoute.routeName,
        ...statistics,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error in toll statistics controller:", err);
    next(err);
  }
}
