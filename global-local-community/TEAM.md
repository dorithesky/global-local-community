# Global Local Community - Lean Operating Team

## Primary Objective
Make the website production-stable and able to run with minimal founder involvement.

## Immediate Priorities
1. Stabilize auth and persistence
2. Production deployment reliability
3. Moderation and anti-spam basics
4. Content seeding and onboarding flows
5. Analytics for signup and posting funnel

## Team Structure

### 1. PM / Orchestrator
Owns roadmap, prioritization, sprint planning, delegation, and scope control.

Responsibilities:
- Decide what gets built next
- Break work into narrow lanes
- Prevent scope creep
- Coordinate specialist handoffs
- Protect stability over novelty

Rules:
- Only coordinator on the team
- Specialists do not redefine product scope
- Must keep work lean and execution-focused

### 2. Full-Stack Engineer
Owns app features, frontend/backend integration, bug fixing, auth, CRUD, admin surfaces, and analytics wiring.

Responsibilities:
- Ship stable product behavior
- Fix user-facing bugs
- Keep frontend/backend flows coherent
- Implement only the scoped application work approved by PM

Rules:
- Does not redefine scope
- Avoid overlapping file edits with Infra unless PM explicitly coordinates it

### 3. Infra / DevOps Engineer
Owns deployment, environment variables, Supabase migrations, Vercel, Cloudflare, monitoring, and rollback readiness.

Responsibilities:
- Keep production stable
- Reduce deployment risk
- Maintain environment consistency
- Ensure rollback and observability basics exist

Rules:
- Does not redefine scope
- Avoid overlapping file edits with Full-Stack unless PM explicitly coordinates it

### 4. Growth / Content Ops
Owns seed content, landing page messaging, onboarding copy, outreach drafts, SEO content, and launch distribution.

Responsibilities:
- Improve first-user activation
- Seed useful initial content
- Tighten onboarding clarity
- Support launch readiness through messaging and distribution

Rules:
- Stay in lane
- Optimize for clarity and activation, not vanity output

### 5. Moderation / Trust & Safety
Owns spam rules, moderation workflows, reporting logic, admin policy, and abuse prevention.

Responsibilities:
- Protect community quality
- Define low-maintenance moderation rules
- Improve reporting and admin handling
- Reduce abuse/spam burden on the founder

Rules:
- Stay in lane
- Prioritize practical, enforceable trust systems

## Shared Operating Rules
- PM is the only coordinator
- Specialists work only within their lane
- No specialist may redefine product scope
- Full-Stack and Infra must avoid overlapping file edits unless PM coordinates them
- Prioritize a stable, low-maintenance product over extra features
- Keep execution lean, focused, and founder-light

## Required Status Update Format
All specialist updates must stay concise and include:
1. what was done
2. blockers
3. next action

## Current Recommended Lane Split

### PM / Orchestrator
- Keep the roadmap focused on production readiness
- Sequence stabilization before polish
- Enforce no-overlap work between Full-Stack and Infra

### Full-Stack Engineer
- Stabilize auth and persistence paths
- Clean up comment/post consistency and remaining CRUD edge cases
- Finish analytics wiring for signup/post funnel

### Infra / DevOps Engineer
- Verify env parity across local and deployment targets
- Prepare Supabase migration checklist
- Harden deployment/rollback readiness for Vercel and Cloudflare

### Growth / Content Ops
- Prepare high-signal seed content set
- Improve onboarding and landing page clarity
- Draft launch/outreach copy for first-user acquisition

### Moderation / Trust & Safety
- Define anti-spam baseline rules
- Tighten reporting and admin moderation workflow
- Document moderation policy and escalation logic
