import crypto from 'crypto';

/**
 * Generate a 6-digit numeric OTP string.
 */
export function generateOtp(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Hash an OTP using SHA-256 with phone number as salt.
 */
export function hashOtp(phone: string, otp: string): string {
  return crypto.createHash('sha256').update(`${phone}:${otp}:selaisathi_otp_salt`).digest('hex');
}

/**
 * Verify if provided OTP matches hashed OTP.
 */
export function verifyOtpHash(phone: string, otp: string, hash: string): boolean {
  const calculated = hashOtp(phone, otp);
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash));
}

/**
 * Hash any token string using SHA-256.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate cryptographically random URL-safe hex string.
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate unique Shop Code (e.g. SS-7492).
 */
export function generateShopCode(prefix: string = 'SS'): string {
  const num = crypto.randomInt(1000, 9999);
  return `${prefix}-${num}`;
}

/**
 * Generate formatted Order Number (e.g. SS-2026-0001).
 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = sequence.toString().padStart(4, '0');
  return `SS-${year}-${padded}`;
}

/**
 * Generate small 4-digit cloth pin token tag (e.g. SS-104).
 */
export function generateFabricTagCode(sequence: number): string {
  const mod = sequence % 1000;
  const padded = mod.toString().padStart(3, '0');
  return `TAG-${padded}`;
}
