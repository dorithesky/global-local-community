# Trust & Safety Baseline

Minimum moderation baseline for launch preparation.

## Goals
- reduce founder moderation burden
- slow obvious spam and abuse early
- make moderator actions consistent
- preserve enough audit trail to review decisions later

## Minimum controls to ship

### 1. Rate limits
- limit post creation frequency per user
- limit comment creation frequency per user
- limit report creation frequency per user
- add stronger friction for very new accounts

### 2. Report integrity
- one report per user per target
- prevent duplicate spam reports on the same post/comment
- require a valid reason code
- store timestamps for escalation review

### 3. Coverage
- support reports for posts
- support reports for comments
- prepare media review path before enabling persistent uploads

### 4. Moderator workflow
Moderator actions should at least support:
- review
- hide
- resolve
- reopen
- add internal note

## Sanction ladder
Use a simple, understandable model:
- warn
- mute
- suspend
- ban

Each action should capture:
- actor
- target user
- reason
- note
- timestamp

## Auditability
Keep a durable moderation log for:
- report status changes
- content visibility changes
- sanctions
- moderator notes

## Policy direction
- prefer clear enforceable rules over complicated scoring systems
- use automation to reduce noise, not replace moderation judgment
- ship practical controls first, sophistication later
