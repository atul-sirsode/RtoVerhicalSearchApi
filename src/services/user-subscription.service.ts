import mysql from "mysql2/promise";
import UserSubscriptionModel from "../models/user-subscription.model.js";
import type {
  UserSubscription,
  CreateUserSubscriptionRequest,
  UpdateUserSubscriptionRequest,
  UserSubscriptionListResponse,
  UserSubscriptionQueryParams,
  UserSubscriptionApiResponse,
} from "../types/user-subscription.types.js";

export class UserSubscriptionService {
  private pool: mysql.Pool | null = null;
  private model: UserSubscriptionModel | null = null;

  constructor() {}

  /**
   * Initialize database connection
   */
  private async initDb(): Promise<void> {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "test",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      this.model = new UserSubscriptionModel(this.pool);
    }
  }

  /**
   * Get all user subscriptions with optional filtering and pagination
   */
  async getUserSubscriptions(
    query: UserSubscriptionQueryParams = {},
  ): Promise<UserSubscriptionApiResponse<UserSubscriptionListResponse>> {
    try {
      await this.initDb();

      const { page = 1, limit = 10, username } = query;

      if (!this.model) {
        throw new Error("Database model not initialized");
      }

      const result = await this.model.findAll({
        ...(username && { username }),
        page,
        limit,
      });

      return {
        status: true,
        message: "User subscriptions retrieved successfully",
        data: {
          subscriptions: result.subscriptions,
          total: result.total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error in getUserSubscriptions:", error);
      return {
        status: false,
        message: "Failed to retrieve user subscriptions",
        statuscode: 500,
      };
    }
  }

  /**
   * Get a single user subscription by username
   */
  async getUserSubscriptionByUsername(
    username: string,
  ): Promise<UserSubscriptionApiResponse<UserSubscription>> {
    try {
      await this.initDb();

      if (!username || username.trim() === "") {
        return {
          status: false,
          message: "Username is required",
          statuscode: 400,
        };
      }

      if (!this.model) {
        throw new Error("Database model not initialized");
      }

      const subscription = await this.model.findByUsername(username);

      if (!subscription) {
        return {
          status: false,
          message: "User subscription not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "User subscription retrieved successfully",
        data: subscription,
      };
    } catch (error) {
      console.error("Error in getUserSubscriptionByUsername:", error);
      return {
        status: false,
        message: "Failed to retrieve user subscription",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new user subscription
   */
  async createUserSubscription(
    data: CreateUserSubscriptionRequest,
  ): Promise<UserSubscriptionApiResponse<UserSubscription>> {
    try {
      await this.initDb();

      // Basic validation
      if (!data.username || data.username.trim() === "") {
        return {
          status: false,
          message: "Username is required",
          statuscode: 400,
        };
      }

      if (!data.start_date || data.start_date.trim() === "") {
        return {
          status: false,
          message: "Start date is required",
          statuscode: 400,
        };
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.start_date)) {
        return {
          status: false,
          message: "Start date must be in YYYY-MM-DD format",
          statuscode: 400,
        };
      }

      // Validate that the date is a valid date
      const startDate = new Date(data.start_date);
      if (isNaN(startDate.getTime())) {
        return {
          status: false,
          message: "Invalid start date",
          statuscode: 400,
        };
      }

      if (!this.model) {
        throw new Error("Database model not initialized");
      }

      // Check if subscription already exists
      const existing = await this.model.exists(data.username);
      if (existing) {
        return {
          status: false,
          message: "Subscription already exists for this username",
          statuscode: 409,
        };
      }

      const subscription = await this.model.create(data);

      return {
        status: true,
        message: "User subscription created successfully",
        data: subscription,
      };
    } catch (error) {
      console.error("Error in createUserSubscription:", error);
      return {
        status: false,
        message: "Failed to create user subscription",
        statuscode: 500,
      };
    }
  }

  /**
   * Update a user subscription by username
   */
  async updateUserSubscription(
    username: string,
    data: UpdateUserSubscriptionRequest,
  ): Promise<UserSubscriptionApiResponse<UserSubscription>> {
    try {
      await this.initDb();

      if (!username || username.trim() === "") {
        return {
          status: false,
          message: "Username is required",
          statuscode: 400,
        };
      }

      // Validate date format if provided
      if (data.start_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.start_date)) {
          return {
            status: false,
            message: "Start date must be in YYYY-MM-DD format",
            statuscode: 400,
          };
        }

        // Validate that the date is a valid date
        const startDate = new Date(data.start_date);
        if (isNaN(startDate.getTime())) {
          return {
            status: false,
            message: "Invalid start date",
            statuscode: 400,
          };
        }
      }

      if (!this.model) {
        throw new Error("Database model not initialized");
      }

      const subscription = await this.model.updateByUsername(username, data);

      if (!subscription) {
        return {
          status: false,
          message: "User subscription not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "User subscription updated successfully",
        data: subscription,
      };
    } catch (error) {
      console.error("Error in updateUserSubscription:", error);
      return {
        status: false,
        message: "Failed to update user subscription",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a user subscription by username
   */
  async deleteUserSubscription(
    username: string,
  ): Promise<UserSubscriptionApiResponse<null>> {
    try {
      await this.initDb();

      if (!username || username.trim() === "") {
        return {
          status: false,
          message: "Username is required",
          statuscode: 400,
        };
      }

      if (!this.model) {
        throw new Error("Database model not initialized");
      }

      const deleted = await this.model.deleteByUsername(username);

      if (!deleted) {
        return {
          status: false,
          message: "User subscription not found",
          statuscode: 404,
        };
      }

      return {
        status: true,
        message: "User subscription deleted successfully",
        data: null,
      };
    } catch (error) {
      console.error("Error in deleteUserSubscription:", error);
      return {
        status: false,
        message: "Failed to delete user subscription",
        statuscode: 500,
      };
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.model = null;
    }
  }
}

export default UserSubscriptionService;
