import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,

  API_BASE: process.env.API_BASE!,
  LOGIN_OTP_URL: process.env.LOGIN_OTP_URL!,
  VERIFY_OTP_URL: process.env.VERIFY_OTP_URL!,
  RC_DETAILS_URL: process.env.RC_DETAILS_URL!,

  // Database configuration
  DB_HOST: process.env.DB_HOST!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,
  DB_TABLE: process.env.DB_TABLE!,

  // RC Details table configuration
  RC_DB_TABLE: process.env.RC_DB_TABLE!,

  // TollGuru API configuration
  TOLLGURU_API_KEY: process.env.TOLLGURU_API_KEY!,
  TOLLGURU_BASE_URL: process.env.TOLLGURU_BASE_URL!,
  TOLLGURU_ENDPOINT: process.env.TOLLGURU_ENDPOINT!,
};
