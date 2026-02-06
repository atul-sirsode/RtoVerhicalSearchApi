import dotenv from "dotenv"

dotenv.config()

export const env = {
    PORT: process.env.PORT || 4000,

    API_BASE: process.env.API_BASE!,
    LOGIN_OTP_URL: process.env.LOGIN_OTP_URL!,
    VERIFY_OTP_URL:process.env.VERIFY_OTP_URL!,
    RC_DETAILS_URL: process.env.RC_DETAILS_URL!
}