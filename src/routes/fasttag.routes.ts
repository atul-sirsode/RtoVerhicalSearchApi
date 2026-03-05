import { Router } from "express";
import FastTagController from "../controllers/fasttag.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();
const fastTagController = new FastTagController();

/**
 * @swagger
 * components:
 *   schemas:
 *     FastTagTransaction:
 *       type: object
 *       required:
 *         - id
 *         - transactionTime
 *         - nature
 *         - amount
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: Unique transaction identifier
 *         processingTime:
 *           type: string
 *           description: When the transaction was processed
 *         transactionTime:
 *           type: string
 *           description: When the transaction occurred
 *         nature:
 *           type: string
 *           enum: [Debit, Credit]
 *           description: Transaction type
 *         amount:
 *           type: string
 *           description: Transaction amount
 *         description:
 *           type: string
 *           description: Transaction description
 *         closingBalance:
 *           type: number
 *           description: Balance after transaction
 *
 *     FastTagDocument:
 *       type: object
 *       required:
 *         - _id
 *         - formType
 *         - vehicleNumber
 *         - openingBalance
 *         - ownerName
 *         - mobile
 *         - carModel
 *         - transactions
 *         - createdAt
 *         - updatedAt
 *         - __v
 *       properties:
 *         _id:
 *           type: string
 *           description: Document ID
 *         formType:
 *           type: string
 *           description: Type of FastTag form
 *         vehicleNumber:
 *           type: string
 *           description: Vehicle registration number
 *         openingBalance:
 *           type: number
 *           description: Initial balance
 *         ownerName:
 *           type: string
 *           description: Owner name
 *         mobile:
 *           type: string
 *           description: Mobile number
 *         carModel:
 *           type: string
 *           description: Car model
 *         bank:
 *           type: string
 *           description: Associated bank
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FastTagTransaction'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         __v:
 *           type: number
 *           description: Version key
 *
 *     CreateFastTagRequest:
 *       type: object
 *       required:
 *         - formType
 *         - vehicleNumber
 *         - openingBalance
 *         - ownerName
 *         - mobile
 *         - carModel
 *       properties:
 *         formType:
 *           type: string
 *         vehicleNumber:
 *           type: string
 *         openingBalance:
 *           type: number
 *         ownerName:
 *           type: string
 *         mobile:
 *           type: string
 *         carModel:
 *           type: string
 *         bank:
 *           type: string
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FastTagTransaction'
 *           description: Array of transactions (optional)
 *
 *     UpdateFastTagRequest:
 *       type: object
 *       properties:
 *         formType:
 *           type: string
 *         vehicleNumber:
 *           type: string
 *         openingBalance:
 *           type: number
 *         ownerName:
 *           type: string
 *         mobile:
 *           type: string
 *         carModel:
 *           type: string
 *         bank:
 *           type: string
 *
 *     AddTransactionRequest:
 *       type: object
 *       required:
 *         - transactionTime
 *         - nature
 *         - amount
 *         - description
 *       properties:
 *         id:
 *           type: string
 *         processingTime:
 *           type: string
 *         transactionTime:
 *           type: string
 *         nature:
 *           type: string
 *           enum: [Debit, Credit]
 *         amount:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/fasttag:
 *   get:
 *     summary: Get all FastTag documents
 *     tags: [FastTag]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (searches in vehicleNumber, ownerName, carModel, formType)
 *       - in: query
 *         name: vehicleNumber
 *         schema:
 *           type: string
 *         description: Filter by vehicle number
 *       - in: query
 *         name: formType
 *         schema:
 *           type: string
 *         description: Filter by form type
 *     responses:
 *       200:
 *         description: FastTags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fasttags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FastTagDocument'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 */
router.get("/", fastTagController.getFastTags.bind(fastTagController));

/**
 * @swagger
 * /api/fasttag:
 *   post:
 *     summary: Create a new FastTag document
 *     tags: [FastTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFastTagRequest'
 *     responses:
 *       201:
 *         description: FastTag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FastTagDocument'
 *       400:
 *         description: Bad request - Missing required fields
 *       409:
 *         description: Conflict - Vehicle number already exists
 */
router.post(
  "/",
  guestRestrictionMiddleware,
  fastTagController.createFastTag.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/{vehicleNumber}:
 *   get:
 *     summary: Get a single FastTag by vehicle number
 *     description: Retrieve a specific FastTag document using the vehicle number
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: vehicleNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *         example: "MH12AB1234"
 *     responses:
 *       200:
 *         description: FastTag retrieved successfully
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
 *                   example: "FastTag retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FastTagDocument'
 *       404:
 *         description: FastTag not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:vehicleNumber",
  fastTagController.getFastTagById.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/{id}:
 *   put:
 *     summary: Update a FastTag document
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FastTag document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFastTagRequest'
 *     responses:
 *       200:
 *         description: FastTag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FastTagDocument'
 *       404:
 *         description: FastTag not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  guestRestrictionMiddleware,
  fastTagController.updateFastTag.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/{vehicleNumber}:
 *   delete:
 *     summary: Delete a FastTag document by vehicle number
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: vehicleNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *         example: "MH12AB1234"
 *     responses:
 *       200:
 *         description: FastTag deleted successfully
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
 *                   example: "FastTag deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad request - Invalid vehicle number
 *       404:
 *         description: FastTag not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:vehicleNumber",
  guestRestrictionMiddleware,
  fastTagController.deleteFastTag.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/{id}/transactions:
 *   post:
 *     summary: Add a transaction to a FastTag document
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FastTag document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fasttag:
 *                       $ref: '#/components/schemas/FastTagDocument'
 *                     transaction:
 *                       $ref: '#/components/schemas/FastTagTransaction'
 *       404:
 *         description: FastTag not found
 *       409:
 *         description: Conflict - Transaction ID already exists
 */
router.post(
  "/:id/transactions",
  guestRestrictionMiddleware,
  fastTagController.addTransaction.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/{id}/transactions/{txnId}:
 *   delete:
 *     summary: Delete a transaction from a FastTag document
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FastTag document ID
 *       - in: path
 *         name: txnId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FastTagDocument'
 *       404:
 *         description: FastTag or transaction not found
 */
router.delete(
  "/:id/transactions/:txnId",
  guestRestrictionMiddleware,
  fastTagController.deleteTransaction.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/stats:
 *   get:
 *     summary: Get FastTag statistics
 *     tags: [FastTag]
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFastTags:
 *                       type: number
 *                     totalTransactions:
 *                       type: number
 *                     formTypeStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 */
router.get("/stats", fastTagController.getFastTagStats.bind(fastTagController));

/**
 * @swagger
 * /api/fasttag/formType/{formType}:
 *   get:
 *     summary: Get FastTags by form type
 *     description: Retrieve FastTags filtered by form type with pagination
 *     tags: [FastTag]
 *     parameters:
 *       - in: path
 *         name: formType
 *         required: true
 *         schema:
 *           type: string
 *         description: Form type to filter by
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: FastTags retrieved successfully by form type
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
 *                   example: "FastTags retrieved successfully by form type"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fasttags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FastTagDocument'
 *                     total:
 *                       type: number
 *                       description: Total number of FastTags matching the form type
 *                     page:
 *                       type: number
 *                       description: Current page number
 *                     limit:
 *                       type: number
 *                       description: Number of items per page
 *       400:
 *         description: Bad request - Form type is required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/formType/:formType",
  fastTagController.getFastTagsByFormType.bind(fastTagController),
);

/**
 * @swagger
 * /api/fasttag/formType/{formType}/daterange:
 *   get:
 *     summary: Get FastTags by form type and date range
 *     tags: [FastTag]
 *     description: Retrieve FastTag documents filtered by form type and updatedAt date range. Includes records with null updatedAt or updatedAt between specified dates.
 *     parameters:
 *       - in: path
 *         name: formType
 *         required: true
 *         schema:
 *           type: string
 *         description: The form type to filter by
 *         example: "blackbuck"
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: FastTags retrieved successfully
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
 *                   example: "FastTags retrieved successfully by form type and date range"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fasttags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FastTagDocument'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get(
  "/formType/:formType/daterange",
  fastTagController.getFastTagsByFormTypeAndDateRange.bind(fastTagController),
);

export default router;
