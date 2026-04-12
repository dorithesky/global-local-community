const REQUIRED_SERVER_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

export function validateServerEnv() {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function getOptionalAdminEmailsConfigured() {
  return Boolean(process.env.ADMIN_EMAILS?.trim());
}
