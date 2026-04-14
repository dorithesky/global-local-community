import crypto from 'crypto';
import { sanitizePlainText } from '@/lib/security';

const MAX_TOKEN_LENGTH = 256;
const MAX_CALLER_LENGTH = 80;
const MAX_AUTHOR_COUNT = 50;

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

export function getAllowedAutomationAuthorIds() {
  return (process.env.OPENCLAW_AUTOMATION_AUTHOR_IDS ?? '')
    .split(',')
    .map((value) => sanitizePlainText(value, { maxLength: 80, allowNewlines: false }))
    .filter(Boolean)
    .slice(0, MAX_AUTHOR_COUNT);
}

export function assertAutomationAuthorAllowed(authorId: string) {
  const allowedAuthorIds = getAllowedAutomationAuthorIds();
  if (!allowedAuthorIds.length) {
    throw new Error('Automation author allowlist is not configured.');
  }

  if (!allowedAuthorIds.includes(authorId)) {
    throw new Error('authorId is not allowed for automation publishing.');
  }
}
