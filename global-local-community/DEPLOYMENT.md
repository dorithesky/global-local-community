# Deployment

## Prelaunch checklist

- `npm run lint`
- `npm run build`
- Apply latest Supabase schema and migrations, including `comment_history_migration.sql`, `comment_soft_delete_migration.sql`, `settings_migration.sql`, `moderation_baseline_migration.sql`, and `media_storage_migration.sql`
- Confirm `/api/health` returns database `ok`
- Confirm `/api/seed` is blocked in production
- Confirm admin access is restricted to approved emails only
- Confirm Google auth, email/password auth, magic link auth, post creation, comments, likes, bookmarks, reports, and admin moderation all work on the target environment
- Confirm rollback path exists for Vercel deploy and Supabase migration changes

## Vercel

1. Push `global-local-community` to GitHub.
2. Import the repo in Vercel.
3. Set these environment variables:
   - `NEXT_PUBLIC_APP_NAME=Global Local Community`
   - `NEXT_PUBLIC_CITY=Daegu`
   - `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
   - `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
   - `NEXT_PUBLIC_GA_ID=<your-ga-id>`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=post-media`
4. Deploy.

## Cloudflare DNS

If using a custom domain:
1. Add domain in Vercel.
2. In Cloudflare DNS, create the record Vercel asks for.
3. Wait for verification.
4. Update `NEXT_PUBLIC_SITE_URL` to the production domain.

## Suggested first production URL

- `community.globallocal.kr`
- or `daegu.globallocal.kr`

## Verification checklist

- `/api/health` returns ok
- Feed loads
- Supabase env vars present
- Create post page renders
- Admin page renders
- Image upload bucket exists and test upload works
- Analytics script present when `NEXT_PUBLIC_GA_ID` is set
