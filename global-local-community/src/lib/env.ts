const REQUIRED_SERVER_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;
const OPTIONAL_SENSITIVE_SERVER_ENV = ['OPENCLAW_AUTOMATION_SECRET'] as const;

function isLocalUrl(value: string) {
  return value.includes('localhost') || value.includes('127.0.0.1');
}

export function validateServerEnv() {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === 'production') {
    if (siteUrl && isLocalUrl(siteUrl)) {
      throw new Error('NEXT_PUBLIC_SITE_URL must not point to localhost in production.');
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Public anon key must not equal the service role key.');
    }

    const automationSecret = process.env.OPENCLAW_AUTOMATION_SECRET?.trim();
    if (automationSecret && automationSecret.length < 32) {
      throw new Error('OPENCLAW_AUTOMATION_SECRET must be at least 32 characters in production.');
    }
  }
}

export function getOptionalSensitiveServerEnvConfigured() {
  return OPTIONAL_SENSITIVE_SERVER_ENV.filter((key) => Boolean(process.env[key]?.trim()));
}

export function getOptionalAdminEmailsConfigured() {
  return Boolean(process.env.ADMIN_EMAILS?.trim());
}
