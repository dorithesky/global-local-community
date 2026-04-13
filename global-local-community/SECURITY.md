# Security Notes

## Public vs server-only environment variables
- `NEXT_PUBLIC_*` values are browser-visible and must never contain secrets.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.

## Approved service-role usage
- `src/lib/supabase-admin.ts`
- `src/lib/request-logging.ts`
- `src/lib/demo-seed.ts`

## Session posture
- Idle timeout: 30 minutes
- Absolute session max age: 12 hours
- Client shows expiry warning before forced sign-out

## Storage expectations
- Uploads limited to approved image types only
- Bucket policies must prevent unauthenticated upload
- Stronger future posture: signed or quarantined upload flow

## Repo guardrails
- Run `npm run check:security`
- CI runs security check, lint, and build on push/PR
