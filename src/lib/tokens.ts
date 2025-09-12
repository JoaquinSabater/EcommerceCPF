import crypto from 'crypto';

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hora
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

// ✅ CAMBIAR A 4 DÍAS
export function generateProspectoToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function generateProspectoTokenExpiry(): Date {
  return new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // ✅ 4 DÍAS
}