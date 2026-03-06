import { Router } from "express";
import UserSubscriptionController from "../controllers/user-subscription.controller.js";
import { guestRestrictionMiddleware } from "../middleware/guest-restriction.middleware.js";

const router = Router();
const userSubscriptionController = new UserSubscriptionController();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSubscription:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - start_date
 *         - validity_days
 *         - end_date
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier (UUID)
 *         username:
 *           type: string
 *           description: User's username
 *         start_date:
 *           type: string
 *           format: date
 *           description: Subscription start date (YYYY-MM-DD)
 *         validity_days:
 *           type: integer
 *           description: Number of days the subscription is valid
 *         end_date:
 *           type: string
 *           format: date
 *           description: Subscription end date (YYYY-MM-DD)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the record was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the record was last updated
 *
 *     CreateUserSubscriptionRequest:
 *       type: object
 *       required:
 *         - username
 *         - start_date
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         start_date:
 *           type: string
 *           format: date
 *           description: Subscription start date (YYYY-MM-DD)
 *         validity_days:
 *           type: integer
 *           description: "Number of days the subscription is valid (default: 30)"
 *
 *     UpdateUserSubscriptionRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         start_date:
 *           type: string
 *           format: date
 *           description: Subscription start date (YYYY-MM-DD)
 *         validity_days:
 *           type: integer
 *           description: Number of days the subscription is valid
 */

/**
 * @swagger
 * /api/user-subscriptions:
 *   get:
 *     summary: Get all user subscriptions
 *     tags: [User Subscriptions]
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
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username (partial match)
 *     responses:
 *       200:
 *         description: User subscriptions retrieved successfully
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
 *                     subscriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserSubscription'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  userSubscriptionController.getUserSubscriptions.bind(
    userSubscriptionController,
  ),
);

/**
 * @swagger
 * /api/user-subscriptions:
 *   post:
 *     summary: Create a new user subscription
 *     tags: [User Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserSubscriptionRequest'
 *     responses:
 *       201:
 *         description: User subscription created successfully
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
 *                   $ref: '#/components/schemas/UserSubscription'
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *       409:
 *         description: Conflict - Subscription already exists for this username
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  guestRestrictionMiddleware,
  userSubscriptionController.createUserSubscription.bind(
    userSubscriptionController,
  ),
);

/**
 * @swagger
 * /api/user-subscriptions/{username}:
 *   get:
 *     summary: Get a single user subscription by username
 *     description: Retrieve a specific user subscription using the username
 *     tags: [User Subscriptions]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User's username
 *     responses:
 *       200:
 *         description: User subscription retrieved successfully
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
 *                   example: "User subscription retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserSubscription'
 *       404:
 *         description: User subscription not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:username",
  userSubscriptionController.getUserSubscriptionByUsername.bind(
    userSubscriptionController,
  ),
);

/**
 * @swagger
 * /api/user-subscriptions/{id}:
 *   put:
 *     summary: Update a user subscription
 *     tags: [User Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserSubscriptionRequest'
 *     responses:
 *       200:
 *         description: User subscription updated successfully
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
 *                   $ref: '#/components/schemas/UserSubscription'
 *       400:
 *         description: Bad request - Invalid data
 *       404:
 *         description: User subscription not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  guestRestrictionMiddleware,
  userSubscriptionController.updateUserSubscription.bind(
    userSubscriptionController,
  ),
);

/**
 * @swagger
 * /api/user-subscriptions/{id}:
 *   delete:
 *     summary: Delete a user subscription
 *     tags: [User Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: User subscription deleted successfully
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
 *                   example: "User subscription deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad request - Invalid ID
 *       404:
 *         description: User subscription not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  guestRestrictionMiddleware,
  userSubscriptionController.deleteUserSubscription.bind(
    userSubscriptionController,
  ),
);

export default router;
