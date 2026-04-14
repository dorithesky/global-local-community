import crypto from 'crypto';
import { sanitizePlainText } from '@/lib/security';

const MAX_TOKEN_LENGTH = 256;
const MAX_CALLER_LENGTH = 80;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAutomationSecret() {
  return sanitizePlainText(process.env.OPENCLAW_AUTOMATION_SECRET, { maxLength: MAX_TOKEN_LENGTH, allowNewlines: false }) || '';
}

export function assertAutomationSecret(requestSecret: string | null) {
  const configured = getAutomationSecret();
  if (!configured) {
    throw new Error('Automation secret is not configured.');
  }

  const candidate = sanitizePlainText(requestSecret, { maxLength: MAX_TOKEN_LENGTH, allowNewlines: false });
  if (!candidate || !safeEqual(candidate, configured)) {
    throw new Error('Invalid automation secret.');
  }
}

export function getAutomationCaller(headers: Headers) {
  return sanitizePlainText(headers.get('x-openclaw-caller') ?? 'unknown', { maxLength: MAX_CALLER_LENGTH, allowNewlines: false }) || 'unknown';
}
