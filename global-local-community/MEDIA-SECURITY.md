# Media security plan

Image posting is important, but public uploads need guardrails.

## Safe first-pass rules
- Accept only JPG, PNG, WebP
- Max 4 files per post
- Max 5MB per file
- Store outside the app filesystem
- Use signed upload flow or controlled storage bucket
- Validate MIME type and extension
- Strip or ignore dangerous metadata where possible
- Reject SVG for now

## Before public launch
1. Create a dedicated storage bucket
2. Apply bucket-level upload rules
3. Generate signed upload URLs server-side
4. Save image URLs in a dedicated `post_media` table or `posts.image_urls`
5. Add moderation path for uploaded media
6. Consider virus scanning / file scanning if volume grows

## Recommended schema additions
- `post_media`
  - `id`
  - `post_id`
  - `url`
  - `mime_type`
  - `size_bytes`
  - `created_at`

## Current product state
- UI allows image selection and validates locally
- server-side durable media persistence is not implemented yet
- this is intentional until the storage/security path is in place
