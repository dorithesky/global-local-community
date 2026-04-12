# Global Local Community

Production-oriented foundation for an English-first community platform for foreigners living in Korea.

## Layered system architecture

1. **Interface Layer**
   - Next.js App Router
   - Mobile-first pages for landing, feed, category, post detail, create post, profile, admin

2. **Application Layer**
   - Route handlers under `src/app/api/*`
   - Modular logic for posts, reports, validation, permissions scaffolding

3. **Data Layer**
   - Supabase Postgres schema in `supabase/schema.sql`
   - Relational tables: profiles, posts, comments, likes, bookmarks, reports, workflow_events

4. **Intelligence Layer**
   - Rule-based content classification
   - Spam/toxicity detection
   - Semantic similarity stub for future recommendations

5. **Orchestration Layer**
   - Lightweight workflow queue abstraction
   - Event-driven hooks for post creation, reports, and onboarding

## Local run

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_ANALYTICS_ID`
- `NEXT_PUBLIC_SITE_URL`

## Supabase setup

```bash
supabase init
supabase db push --file supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Deployment plan

1. Push repo to GitHub
2. Create Supabase project
3. Add schema + seed data
4. Import repo to Vercel
5. Set env vars in Vercel
6. Point Cloudflare DNS to Vercel target

## What works now

- Layered architecture skeleton
- Mobile-first UI
- Feed, category, detail, create, profile, saved, activity, settings, and admin pages
- Google auth, email/password auth, and magic link auth
- Profile sync and editable public profile settings
- Persistent post creation, comments, likes, bookmarks, reports, and admin moderation reads through Supabase-backed app flows
- Seeded realistic posts for empty-state resilience
- Rule-based AI layer and workflow queue
- DB-aware health endpoint

## Current launch blockers being addressed

- Public API routes for posts and reports still need to be aligned to the same durable persistence path as the main app
- Production trust controls are still baseline-only and need rate limits, sanction states, stronger moderation auditability, and durable role management rollout
- Durable media upload is intentionally not live until secure signed upload and moderation review exist
- Deployment discipline still needs repeatable migration checks, RLS/policies, and rollback verification

## Product direction

This product is for foreigners living in Korea who need a cleaner, more trustworthy place to ask for help about housing, jobs, and daily life.

The near-term shipping bias is:
- production stability first
- low founder maintenance
- better onboarding and activation copy
- practical trust and safety controls before broader launch
- durable admin and moderator roles instead of brittle config-only access
