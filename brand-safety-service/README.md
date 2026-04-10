# Brand Guard & Domain Scout

Python microservice for early-stage brand validation.

## What changed in the current backend
- trademark lookup now fails safely instead of quietly treating upstream misses as low risk
- obvious famous brands trigger a hard high-risk watchlist match
- direct matches can still surface even when class overlap is weak
- responses now distinguish between:
  - successful trademark search with no strong hits
  - inconclusive trademark search

## Features
### Phase 1: Trademark conflict screening
- checks direct-match trademark collisions
- checks likelihood-of-confusion using fuzzy text similarity and phonetic normalization
- uses a conservative famous-brand watchlist to avoid embarrassing false negatives
- treats inconclusive trademark lookup as cautionary, not safe
- returns a `safety_score` and `risk_level` (`Low`, `Medium`, `High`)

### Phase 2: Multi-extension domain lookup
Checks:
- `.com`
- `.ai`
- `.io`
- `.co`

Returns a digital availability map with statuses like:
- `Resolvable`
- `Not Resolvable`
- `Unknown`

Note: these are DNS-level signals only, not registrar-confirmed availability. `Premium` requires future registrar/marketplace integration.

### Phase 3: Launch readiness report
- summarizes brand viability
- recommends whether to proceed
- suggests 3 to 5 alternative name variations using prefixes/suffixes

## Run locally
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

## Deploy on Render
- `render.yaml` is included
- create a new Render Blueprint or Web Service from this folder
- deploy the API
- frontend expects the API at:
  - `https://brand-guard-domain-scout-api.onrender.com`

## Example request
```bash
curl -X POST http://127.0.0.1:8000/brand-check \
  -H 'content-type: application/json' \
  -d '{
    "brand_name": "Clawbot",
    "industry_keywords": ["ai", "saas", "automation"]
  }'
```

## Example response behavior
- if the search is inconclusive, the service should not return a falsely reassuring low-risk result
- if a globally famous brand like `IKEA` is entered, the service should force a high-risk outcome

## Caveats
- This is an automated screening layer, not legal advice.
- Trademark search currently uses a practical live endpoint plus local safeguards, not a full local USPTO index yet.
- DNS resolution is not equivalent to registrar-confirmed availability.
- The service is intentionally conservative and should trigger legal review before launch decisions.
- `risk_level` and `blocking_reasons` should be treated as primary decision signals, not just `safety_score`.
- The next major reliability upgrade is replacing thin live endpoint dependence with a local trademark index built from bulk data.
