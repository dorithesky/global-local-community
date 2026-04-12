# Product inspection

## High-value features already in place
- Google auth
- Email magic link auth
- Email + password sign up / sign in
- Password reset
- Profile sync and editable public profiles
- Korea-wide location support
- Post creation
- Comments with edit/delete
- Reports
- Likes / bookmarks
- Saved posts page
- Activity page
- Admin visibility for reports and comment history
- Settings and consent persistence

## Current launch blockers

### 1. API and app persistence are still split
The main product flows are Supabase-backed, but `/api/posts` and `/api/reports` still do not match the same durable persistence path. That is a source-of-truth problem and should be fixed before launch.

### 2. Trust and safety baseline is still too light
The app needs a minimum moderation baseline before broader launch:
- posting rate limits
- reporting rate limits
- one report per user per target
- comment reporting
- moderator notes and action log
- sanction states like warn, mute, suspend, ban

### 3. Deployment guardrails are not fully production-safe yet
Still needed:
- Supabase RLS/policies
- repeatable migration flow
- rollback checklist
- deploy verification checklist
- monitoring/alerting basics

### 4. Onboarding and activation are not strong enough yet
A first-time user should quickly understand:
- who this is for
- why it is better than scattered group chats
- what to do first
- how to write a post that gets useful replies

### 5. Media remains intentionally deferred
Image selection UI exists, but durable uploads should not launch until signed upload flow, storage rules, and moderation review exist.

## Recommendation
If the goal is launch soon, the best next improvements are:
1. Align API routes with durable Supabase persistence
2. Ship minimum trust and safety baseline
3. Add deployment guardrails and DB hardening
4. Strengthen onboarding and activation copy
