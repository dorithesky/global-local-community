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
- Feed, category, detail, create, profile, admin pages
- Seeded realistic posts (40 records)
- Rule-based AI layer and workflow queue
- API health/posts/reports endpoints

## What is still missing

- Real Supabase auth wiring for email + Google
- Persistent CRUD against live database
- Admin auth/permissions
- GA instrumentation events
- Vercel/Cloudflare live deployment
- Background worker runtime for production orchestration
- Rich search and caching
