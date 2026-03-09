import type { Request, Response, NextFunction } from "express";
import { AutoAdjustAmountService } from "../services/auto-adjust-amount.service.js";
import type {
  AutoAdjustAmount,
  AutoAdjustAmountCreate,
  AutoAdjustAmountUpdate,
} from "../models/auto-adjust-amount.model.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     AutoAdjustAmount:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: Auto adjust amount ID (tinyint unsigned)
 *           example: 1
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Auto adjust amount value
 *           example: 100.50
 *     AutoAdjustAmountCreate:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Auto adjust amount value
 *           example: 100.50
 *           minimum: 0
 *     AutoAdjustAmountUpdate:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Auto adjust amount value
 *           example: 150.75
 *           minimum: 0
 *     AutoAdjustAmountResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Auto adjust amount retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/AutoAdjustAmount'
 *         statuscode:
 *           type: integer
 *           example: 200
 *     AutoAdjustAmountListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Auto adjust amounts retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AutoAdjustAmount'
 *         statuscode:
 *           type: integer
 *           example: 200
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Auto adjust amount not found"
 *         statuscode:
 *           type: integer
 *           example: 404
 */

/**
 * @swagger
 * /api/auto-adjust-amount:
 *   get:
 *     summary: Get all auto adjust amounts
 *     tags: [Auto Adjust Amount]
 *     responses:
 *       200:
 *         description: Auto adjust amounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutoAdjustAmountListResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
export async function getAllAutoAdjustAmounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const service = new AutoAdjustAmountService();
    const result = await service.getAllAutoAdjustAmounts();

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getAllAutoAdjustAmounts controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/auto-adjust-amount/{id}:
 *   get:
 *     summary: Get auto adjust amount by ID
 *     tags: [Auto Adjust Amount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 255
 *         description: Auto adjust amount ID
 *     responses:
 *       200:
 *         description: Auto adjust amount retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutoAdjustAmountResponse'
 *       404:
 *         description: Auto adjust amount not found
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
export async function getAutoAdjustAmount(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1 || id > 255) {
      const errorResponse = {
        status: false,
        message: "Invalid ID. Must be a number between 1 and 255",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const service = new AutoAdjustAmountService();
    const result = await service.getAutoAdjustAmount(id);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getAutoAdjustAmount controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/auto-adjust-amount:
 *   post:
 *     summary: Create new auto adjust amount
 *     tags: [Auto Adjust Amount]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutoAdjustAmountCreate'
 *     responses:
 *       201:
 *         description: Auto adjust amount created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutoAdjustAmountResponse'
 *       400:
 *         description: Bad request - invalid amount
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
export async function createAutoAdjustAmount(
  req: Request<{}, {}, AutoAdjustAmountCreate>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      const errorResponse = {
        status: false,
        message: "Amount must be a positive number",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const service = new AutoAdjustAmountService();
    const result = await service.createAutoAdjustAmount({ amount });

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createAutoAdjustAmount controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/auto-adjust-amount/{id}:
 *   put:
 *     summary: Update auto adjust amount by ID
 *     tags: [Auto Adjust Amount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 255
 *         description: Auto adjust amount ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutoAdjustAmountUpdate'
 *     responses:
 *       200:
 *         description: Auto adjust amount updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutoAdjustAmountResponse'
 *       400:
 *         description: Bad request - invalid amount or ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Auto adjust amount not found
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
export async function updateAutoAdjustAmount(
  req: Request<{ id: string }, {}, AutoAdjustAmountUpdate>,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id);
    const { amount } = req.body;

    if (isNaN(id) || id < 1 || id > 255) {
      const errorResponse = {
        status: false,
        message: "Invalid ID. Must be a number between 1 and 255",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    if (typeof amount !== 'number' || amount < 0) {
      const errorResponse = {
        status: false,
        message: "Amount must be a positive number",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const service = new AutoAdjustAmountService();
    const result = await service.updateAutoAdjustAmount(id, { amount });

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in updateAutoAdjustAmount controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/auto-adjust-amount/{id}:
 *   delete:
 *     summary: Delete auto adjust amount by ID
 *     tags: [Auto Adjust Amount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 255
 *         description: Auto adjust amount ID
 *     responses:
 *       200:
 *         description: Auto adjust amount deleted successfully
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
 *                   example: "Auto adjust amount deleted successfully"
 *       404:
 *         description: Auto adjust amount not found
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
export async function deleteAutoAdjustAmount(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1 || id > 255) {
      const errorResponse = {
        status: false,
        message: "Invalid ID. Must be a number between 1 and 255",
        statuscode: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const service = new AutoAdjustAmountService();
    const result = await service.deleteAutoAdjustAmount(id);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in deleteAutoAdjustAmount controller:", err);
    next(err);
  }
}
