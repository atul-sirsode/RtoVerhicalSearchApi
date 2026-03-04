export interface UserSubscription {
  id: string;
  username: string;
  start_date: Date;
  validity_days: number;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserSubscriptionRequest {
  username: string;
  start_date: string; // YYYY-MM-DD format
  validity_days?: number; // Optional, defaults to 30
}

export interface UpdateUserSubscriptionRequest {
  username?: string;
  start_date?: string; // YYYY-MM-DD format
  validity_days?: number;
}

export interface UserSubscriptionListResponse {
  subscriptions: UserSubscription[];
  total: number;
  page: number;
  limit: number;
}

export interface UserSubscriptionQueryParams {
  page?: number;
  limit?: number;
  username?: string;
}

export interface UserSubscriptionApiResponse<T> {
  status: boolean;
  message: string;
  statuscode?: number;
  data?: T;
}
