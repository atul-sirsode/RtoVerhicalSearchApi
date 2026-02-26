import type { Request, Response, NextFunction } from "express";
import { StatesCitiesService } from "../services/states-cities.service.js";
import type {
  State,
  City,
  InsertCityRequest,
  DeleteCityRequest,
} from "../services/states-cities.service.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     State:
 *       type: object
 *       properties:
 *         state_name:
 *           type: string
 *           description: Name of the state
 *           example: "Maharashtra"
 *         iso_code:
 *           type: string
 *           description: ISO code of the state
 *           example: "IN-MH"
 *     City:
 *       type: object
 *       properties:
 *         city_name:
 *           type: string
 *           description: Name of the city
 *           example: "Mumbai"
 *     InsertCityRequest:
 *       type: object
 *       required:
 *         - city_name
 *         - iso_code
 *       properties:
 *         city_name:
 *           type: string
 *           description: Name of the city to insert
 *           example: "New City"
 *         iso_code:
 *           type: string
 *           description: ISO code of the state where the city should be added
 *           example: "IN-MH"
 *     DeleteCityRequest:
 *       type: object
 *       required:
 *         - city_name
 *         - iso_code
 *       properties:
 *         city_name:
 *           type: string
 *           description: Name of the city to delete
 *           example: "Old City"
 *         iso_code:
 *           type: string
 *           description: ISO code of the state where the city exists
 *           example: "IN-MH"
 *     InsertCityResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "City inserted successfully"
 *         data:
 *           type: object
 *           $ref: '#/components/schemas/City'
 *     StatesResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "States retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/State'
 *     CitiesResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Cities retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/City'
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "State not found"
 *         statuscode:
 *           type: integer
 *           example: 404
 */

/**
 * @swagger
 * /api/states-cities/get-states:
 *   get:
 *     summary: Get all states with their ISO codes
 *     tags: [States & Cities]
 *     responses:
 *       200:
 *         description: States retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatesResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
export async function getStates(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const statesCitiesService = new StatesCitiesService();
    const states = await statesCitiesService.getStates();

    const response = {
      status: true,
      message: "States retrieved successfully",
      data: states,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/states-cities/get-city-by-state:
 *   get:
 *     summary: Get all cities for a given state ISO code
 *     tags: [States & Cities]
 *     parameters:
 *       - in: query
 *         name: iso_code
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the state
 *         example: "IN-MH"
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitiesResponse'
 *       400:
 *         description: Bad request - missing ISO code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: State not found
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
export async function getCitiesByState(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { iso_code } = req.query;

    if (!iso_code || typeof iso_code !== "string") {
      const errorResponse = {
        status: false,
        message: "ISO code is required and must be a string",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const statesCitiesService = new StatesCitiesService();

    // Check if state exists
    const stateExists = await statesCitiesService.stateExists(iso_code);
    if (!stateExists) {
      const errorResponse = {
        status: false,
        message: "State not found",
        statuscode: 404,
      };
      return res.status(404).json(errorResponse);
    }

    const cities = await statesCitiesService.getCitiesByState(iso_code);

    const response = {
      status: true,
      message: "Cities retrieved successfully",
      data: cities,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/states-cities/stats:
 *   get:
 *     summary: Get statistics about states and cities
 *     tags: [States & Cities]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: "Statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStates:
 *                       type: integer
 *                       example: 36
 *                     totalCities:
 *                       type: integer
 *                       example: 4000
 *       500:
 *         description: Internal server error
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const statesCitiesService = new StatesCitiesService();
    const stats = await statesCitiesService.getStats();

    const response = {
      status: true,
      message: "Statistics retrieved successfully",
      data: stats,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/states-cities/insert-city:
 *   post:
 *     summary: Insert a new city for a given state
 *     tags: [States & Cities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertCityRequest'
 *     responses:
 *       200:
 *         description: City inserted successfully
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
 *                   example: "City inserted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     city_name:
 *                       type: string
 *                       example: "New City"
 *                     iso_code:
 *                       type: string
 *                       example: "IN-MH"
 *                     state_name:
 *                       type: string
 *                       example: "Maharashtra"
 *       400:
 *         description: Bad request - missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: State not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       409:
 *         description: City already exists for this state
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
export async function insertCity(
  req: Request<{}, {}, InsertCityRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { city_name, iso_code } = req.body;

    // Validate input
    if (!city_name || !iso_code) {
      const errorResponse = {
        status: false,
        message: "City name and ISO code are required",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    // Trim whitespace from city name
    const trimmedCityName = city_name.trim();
    if (!trimmedCityName) {
      const errorResponse = {
        status: false,
        message: "City name cannot be empty",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const statesCitiesService = new StatesCitiesService();
    const result = await statesCitiesService.insertCity({
      city_name: trimmedCityName,
      iso_code: iso_code.trim(),
    });

    if (!result.success) {
      // Determine appropriate status code based on error message
      let statusCode = 500;
      if (result.message.includes("does not exist")) {
        statusCode = 404;
      } else if (result.message.includes("already exists")) {
        statusCode = 409;
      } else if (
        result.message.includes("required") ||
        result.message.includes("empty")
      ) {
        statusCode = 400;
      }

      const errorResponse = {
        status: false,
        message: result.message,
        statuscode: statusCode,
      };
      return res.status(statusCode).json(errorResponse);
    }

    const response = {
      status: true,
      message: result.message,
      data: {
        city_name: trimmedCityName,
        iso_code: iso_code.trim(),
        state_name: result.state_name,
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/states-cities/delete-city:
 *   delete:
 *     summary: Delete a city for a given state
 *     tags: [States & Cities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteCityRequest'
 *     responses:
 *       200:
 *         description: City deleted successfully
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
 *                   example: "City deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     city_name:
 *                       type: string
 *                       example: "Old City"
 *                     iso_code:
 *                       type: string
 *                       example: "IN-MH"
 *                     state_name:
 *                       type: string
 *                       example: "Maharashtra"
 *       400:
 *         description: Bad request - missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: State or city not found
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
export async function deleteCity(
  req: Request<{}, {}, DeleteCityRequest>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { city_name, iso_code } = req.body;

    // Validate input
    if (!city_name || !iso_code) {
      const errorResponse = {
        status: false,
        message: "City name and ISO code are required",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    // Trim whitespace from city name
    const trimmedCityName = city_name.trim();
    if (!trimmedCityName) {
      const errorResponse = {
        status: false,
        message: "City name cannot be empty",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const statesCitiesService = new StatesCitiesService();
    const result = await statesCitiesService.deleteCity({
      city_name: trimmedCityName,
      iso_code: iso_code.trim(),
    });

    if (!result.success) {
      // Determine appropriate status code based on error message
      let statusCode = 500;
      if (
        result.message.includes("does not exist") ||
        result.message.includes("not found")
      ) {
        statusCode = 404;
      } else if (
        result.message.includes("required") ||
        result.message.includes("empty")
      ) {
        statusCode = 400;
      }

      const errorResponse = {
        status: false,
        message: result.message,
        statuscode: statusCode,
      };
      return res.status(statusCode).json(errorResponse);
    }

    const response = {
      status: true,
      message: result.message,
      data: {
        city_name: trimmedCityName,
        iso_code: iso_code.trim(),
        state_name: result.state_name,
      },
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
}
