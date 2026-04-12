export const SESSION_CONFIG = {
  EXPIRY_DAYS: 7,
} as const;

export const OTP_CONFIG = {
  LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 30,
} as const;
