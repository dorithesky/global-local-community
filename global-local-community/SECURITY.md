# Security Notes

## Public vs server-only environment variables
- `NEXT_PUBLIC_*` values are browser-visible and must never contain secrets.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.

## Approved service-role usage
- `src/lib/supabase-admin.ts`
- `src/lib/request-logging.ts`
- `src/lib/demo-seed.ts`
- `src/app/api/admin/automation/seed-post/route.ts` (operator-scoped automation path, guarded by `OPENCLAW_AUTOMATION_SECRET` and approved content-operator verification)

## Internal automation secret
- `OPENCLAW_AUTOMATION_SECRET` must stay server-only.
- Minimum production expectation: 32+ random characters.
- Never expose it in client code, logs, chat, or `NEXT_PUBLIC_*` variables.
- Current scope is intentionally narrow: it may only create seed posts through approved `content_operator` accounts.
- It must not be reused for general admin or moderation actions.
- If compromised, rotate it immediately and review workflow/security events for `moderation.seed_post_automation_used`.

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
