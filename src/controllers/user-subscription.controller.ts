import type { Request, Response } from "express";
import UserSubscriptionService from "../services/user-subscription.service.js";
import type {
  CreateUserSubscriptionRequest,
  UpdateUserSubscriptionRequest,
  UserSubscriptionQueryParams,
} from "../types/user-subscription.types.js";

export class UserSubscriptionController {
  private userSubscriptionService: UserSubscriptionService;

  constructor() {
    this.userSubscriptionService = new UserSubscriptionService();
  }

  /**
   * GET /api/user-subscriptions
   * Get all user subscriptions with optional filtering and pagination
   */
  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const query: UserSubscriptionQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        username: req.query.username as string,
      };

      const result = await this.userSubscriptionService.getUserSubscriptions(query);

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getUserSubscriptions:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * POST /api/user-subscriptions
   * Create a new user subscription
   */
  async createUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserSubscriptionRequest = req.body;

      const result = await this.userSubscriptionService.createUserSubscription(data);

      if (result.status) {
        res.status(201).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in createUserSubscription:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * GET /api/user-subscriptions/:username
   * Get a single user subscription by username
   */
  async getUserSubscriptionByUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const result = await this.userSubscriptionService.getUserSubscriptionByUsername(
        username as string
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in getUserSubscriptionByUsername:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * PUT /api/user-subscriptions/:username
   * Update a user subscription by username
   */
  async updateUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const data: UpdateUserSubscriptionRequest = req.body;

      const result = await this.userSubscriptionService.updateUserSubscription(
        username as string,
        data
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in updateUserSubscription:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }

  /**
   * DELETE /api/user-subscriptions/:username
   * Delete a user subscription by username
   */
  async deleteUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const result = await this.userSubscriptionService.deleteUserSubscription(
        username as string
      );

      if (result.status) {
        res.status(200).json(result);
      } else {
        res.status(result.statuscode || 500).json(result);
      }
    } catch (error) {
      console.error("Controller error in deleteUserSubscription:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
        statuscode: 500,
      });
    }
  }
}

export default UserSubscriptionController;
