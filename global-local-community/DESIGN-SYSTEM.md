# Global Local Community Design System

Canonical visual and UX system for a premium, high-trust, English-first community product.

## Visual direction
- premium
- calm
- high-trust
- mobile-first
- community-driven without clutter
- modern and readable
- optimized for foreigners living in Korea
- English-first

## Core aesthetic rules
- Do not use flat gray sterility.
- Do not use rainbow/noisy community-app styling.
- Use color intentionally to create hierarchy, trust, and light page differentiation.
- Trust cues should read as quiet metadata, not loud decorative badges.

## Color roles
### Foundation
- warm white backgrounds
- soft slate structure and text

### Primary accent
- deep civic blue
- use for:
  - primary CTAs
  - active navigation
  - key links
  - important product anchors

### Secondary accent
- restrained teal
- use for:
  - discovery moments
  - community warmth
  - supportive highlight surfaces
- never compete with primary action color

### Semantic colors
- emerald = healthy, verified, completed
- amber = caution, review, pending
- rose = risk, reporting, sanctions, destructive actions

## Surface tiers
1. base surface
   - white / warm white
   - primary reading surfaces
2. elevated accent surface
   - low-saturation blue or teal tint
   - onboarding, home guidance, feature framing
3. semantic surface
   - low-saturation emerald / amber / rose tint
   - only when state meaning matters
4. admin graphite surface
   - reserved for admin/operator emphasis and denser decision areas

## Category accents
- housing: blue-steel
- jobs: blue-indigo
- daily life: teal
- events: sky-teal support
- marketplace: cool slate-blue support
- admin: graphite with restrained amber/rose semantics

## Typography
- keep typography clean, modern, and highly readable
- one eyebrow pattern
- one page-title pattern
- one supporting body pattern
- do not solve hierarchy with oversized type everywhere
- prefer strong section contrast and spacing over excessive text weight

## Radius scale
Use one system only:
- small interactive: rounded-xl
- standard controls/cards: rounded-2xl
- large feature surfaces: rounded-3xl
- do not mix arbitrary 28px / 30px / 32px custom radii unless migrating legacy code toward this scale

## CTA hierarchy
1. primary
   - deep civic blue fill
   - reserved for the main action on a surface
2. secondary
   - white/light surface with tinted border
   - supportive but clearly weaker than primary
3. tertiary
   - text or ghost action
   - used for lower-priority navigation/utilities

## Shared primitives to standardize
- SiteShell
- PageHeader
- SurfaceCard
- StatusBanner
- EmptyState
- ActionBar
- FilterBar
- FormField
- Chip
- Badge
- Avatar
- IdentityRow
- MetaRow

## Shared UX rules
- signed-out surfaces may explain and convert
- signed-in surfaces should foreground useful content and next actions quickly
- Home and Feed must have distinct roles if both remain
- post cards should optimize scan speed first, metadata second
- post detail should prioritize reply/composer/thread over secondary diagnostics
- onboarding should feed directly into relevance and first action
- admin should feel like a decision workspace, not a generic data dashboard

## Page-template rules
### Landing
- concise hero
- trust/proof row
- value/how-it-works row
- recent post preview
- CTA band

### Feed
- concise section header
- optional onboarding/status banner
- filter bar
- post list/grid
- action-oriented empty state

### Category
- category-tinted header
- category chips / scope controls
- same feed mechanics

### Post detail
- post hero
- compact meta/action bar
- body/media
- reply composer or sign-in wall
- thread
- lower-priority trust/report disclosures

### Create post
- structured guidance
- category-aware prompts
- grouped form sections
- clear primary submit area

### Profile
- identity summary first
- trust/maturity/context second
- posts/comments/activity after

### Admin
- summary
- triage queue
- member operations
- audit/context
- stronger priority separation than user-facing pages

## Implementation order
1. tokens and semantic roles
2. shared primitives
3. shell/header/cards/buttons/forms/badges/filters
4. page template alignment
5. final consistency and polish pass
