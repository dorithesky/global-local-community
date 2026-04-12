const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizePlainText(value: unknown, options?: { maxLength?: number; allowNewlines?: boolean }) {
  const maxLength = options?.maxLength ?? 5000;
  const allowNewlines = options?.allowNewlines ?? true;
  const text = String(value ?? '')
    .replace(CONTROL_CHARS, '')
    .replace(/\r/g, '')
    .trim();

  const normalized = allowNewlines ? text : text.replace(/\n+/g, ' ');
  return normalized.slice(0, maxLength);
}

export function sanitizeTagList(value: unknown, maxItems = 8) {
  return String(value ?? '')
    .split(',')
    .map((tag) => sanitizePlainText(tag, { maxLength: 32, allowNewlines: false }).toLowerCase())
    .filter(Boolean)
    .slice(0, maxItems);
}

export function sanitizePathSegment(value: unknown, fallback = 'unknown') {
  const cleaned = sanitizePlainText(value, { maxLength: 80, allowNewlines: false }).replace(/[^a-zA-Z0-9-_/]/g, '');
  return cleaned || fallback;
}
