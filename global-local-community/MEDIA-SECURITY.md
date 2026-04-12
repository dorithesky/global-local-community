# Media security plan

Image posting is important, but public uploads need guardrails.

## Safe first-pass rules
- Accept only JPG, PNG, WebP
- Max 4 files per post
- Max 5MB per file
- Store outside the app filesystem
- Use a dedicated cloud storage bucket
- Validate MIME type and extension
- Strip or ignore dangerous metadata where possible
- Reject SVG for now

## Current implementation direction
- app uploads images to a hosted Supabase Storage bucket
- post records persist hosted image URLs in `posts.image_urls`
- media metadata persists in `post_media`
- Scott's local machine is not used for production storage

## What Scott needs to do in Supabase
1. Create a storage bucket named `post-media`
2. Keep the bucket public for MVP display simplicity, or use signed delivery later
3. Add bucket rules so only authenticated users can upload into their own folder prefix
4. Apply `supabase/media_storage_migration.sql`
5. Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side envs, never in the browser

## Before public launch
1. Create the `post-media` bucket
2. Apply bucket-level upload rules
3. Apply `media_storage_migration.sql`
4. Verify uploads succeed from the create-post flow
5. Verify image URLs persist in `posts.image_urls` and `post_media`
6. Add moderation path for uploaded media
7. Consider file scanning if volume grows

## Recommended storage policy shape
- allow authenticated uploads only
- scope uploads to paths prefixed by the uploader user id
- allow public read only if you explicitly want public image delivery
- otherwise move to signed delivery later

## Current product state
- UI allows image selection and validates locally
- app is now wired to upload selected images to hosted Supabase Storage before post creation
- durable image persistence depends on the cloud bucket and DB migration being created/applied
