import mysql from "mysql2/promise";
import type {
  UserSubscription,
  CreateUserSubscriptionRequest,
  UpdateUserSubscriptionRequest,
} from "../types/user-subscription.types.js";

export class UserSubscriptionModel {
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.pool = pool;
  }

  /**
   * Get all user subscriptions with optional filtering and pagination
   */
  async findAll(
    filters: {
      username?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ subscriptions: UserSubscription[]; total: number }> {
    const { username, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (username) {
      whereClause += " AND username LIKE ?";
      params.push(`%${username}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM user_subscriptions ${whereClause}`;
    const [countResult] = await this.pool.execute(countQuery, params);
    const total = (countResult as any)[0].total;

    // Get records with pagination
    const query = `
      SELECT 
        id, 
        username, 
        DATE_FORMAT(start_date, '%Y-%m-%d') as start_date,
        validity_days,
        DATE_FORMAT(end_date, '%Y-%m-%d') as end_date,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM user_subscriptions 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const [rows] = await this.pool.execute(query, params);

    const subscriptions = (rows as any[]).map((row) => ({
      ...row,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));

    return { subscriptions, total };
  }

  /**
   * Get a single user subscription by username
   */
  async findByUsername(username: string): Promise<UserSubscription | null> {
    const query = `
      SELECT 
        id, 
        username, 
        DATE_FORMAT(start_date, '%Y-%m-%d') as start_date,
        validity_days,
        DATE_FORMAT(end_date, '%Y-%m-%d') as end_date,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM user_subscriptions 
      WHERE username = ?
    `;

    const [rows] = await this.pool.execute(query, [username]);
    const result = (rows as any[])[0];

    if (!result) return null;

    return {
      ...result,
      start_date: new Date(result.start_date),
      end_date: new Date(result.end_date),
      created_at: new Date(result.created_at),
      updated_at: new Date(result.updated_at),
    };
  }

  /**
   * Create a new user subscription
   */
  async create(data: CreateUserSubscriptionRequest): Promise<UserSubscription> {
    const { username, start_date, validity_days = 30 } = data;

    // Calculate end_date based on start_date and validity_days
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + validity_days);

    const query = `
      INSERT INTO user_subscriptions (id, username, start_date, validity_days, end_date)
      VALUES (UUID(), ?, ?, ?, ?)
    `;

    await this.pool.execute(query, [
      username,
      start_date!,
      validity_days,
      endDate.toISOString().split("T")[0],
    ] as any);

    // Get the inserted record
    const inserted = await this.findByUsername(username);
    if (!inserted) {
      throw new Error("Failed to retrieve created subscription");
    }

    return inserted;
  }

  /**
   * Update a user subscription by username
   */
  async updateByUsername(
    username: string,
    data: UpdateUserSubscriptionRequest,
  ): Promise<UserSubscription | null> {
    const existing = await this.findByUsername(username);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.username !== undefined) {
      updates.push("username = ?");
      params.push(data.username);
    }

    if (data.start_date !== undefined) {
      updates.push("start_date = ?");
      params.push(data.start_date);
    }

    if (data.validity_days !== undefined) {
      updates.push("validity_days = ?");
      params.push(data.validity_days);
    }

    if (updates.length === 0) return existing;

    // If start_date or validity_days changed, recalculate end_date
    if (data.start_date !== undefined || data.validity_days !== undefined) {
      const newStartDate = data.start_date
        ? new Date(data.start_date)
        : existing.start_date;
      const newValidityDays = data.validity_days ?? existing.validity_days;
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + newValidityDays);

      updates.push("end_date = ?");
      params.push(newEndDate.toISOString().split("T")[0]);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(username);

    const query = `
      UPDATE user_subscriptions 
      SET ${updates.join(", ")}
      WHERE username = ?
    `;

    await this.pool.execute(query, params);

    // Get the updated record
    const updatedUsername = data.username ?? username;
    return await this.findByUsername(updatedUsername);
  }

  /**
   * Delete a user subscription by username
   */
  async deleteByUsername(username: string): Promise<boolean> {
    const query = "DELETE FROM user_subscriptions WHERE username = ?";
    const [result] = await this.pool.execute(query, [username]);
    return (result as any).affectedRows > 0;
  }

  /**
   * Check if a subscription exists for a username
   */
  async exists(username: string): Promise<boolean> {
    const query =
      "SELECT COUNT(*) as count FROM user_subscriptions WHERE username = ?";
    const [result] = await this.pool.execute(query, [username]);
    return (result as any)[0].count > 0;
  }
}

export default UserSubscriptionModel;
