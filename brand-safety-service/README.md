# Brand Guard & Domain Scout

Python microservice for early-stage brand validation.

## Features
### Phase 1: USPTO conflict screening
- checks direct-match trademark collisions
- checks likelihood-of-confusion using fuzzy text similarity and phonetic normalization
- filters against inferred NICE classes from industry keywords
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

## Example response
```json
{
  "brand_name": "Clawbot",
  "relevant_nice_classes": [9, 42],
  "risk_level": "Medium",
  "safety_score": 61,
  "confidence_level": "Medium",
  "blocking_reasons": ["registrar_unverified", "domain_not_confirmed_free"],
  "digital_availability": {
    "clawbot.com": "Resolvable",
    "clawbot.ai": "Not Resolvable",
    "clawbot.io": "Resolvable",
    "clawbot.co": "Unknown"
  },
  "registrar_availability_verified": false,
  "trademark_conflicts": [],
  "launch_readiness_report": {
    "summary": "Clawbot has medium trademark risk...",
    "recommendation": "Proceed carefully..."
  },
  "suggested_variations": [
    {
      "candidate": "getclawbot",
      "risk_level": "Low",
      "digital_availability": {
        "getclawbot.com": "Available",
        "getclawbot.ai": "Available",
        "getclawbot.io": "Available",
        "getclawbot.co": "Available"
      }
    }
  ],
  "notes": []
}
```

## Caveats
- This is an automated screening layer, not legal advice.
- Trademark search uses a practical USPTO-oriented endpoint plus local fuzzy/phonetic scoring.
- DNS resolution is not equivalent to registrar-confirmed availability.
- The service is intentionally conservative and should trigger legal review before launch decisions.
- `risk_level` and `blocking_reasons` should be treated as primary decision signals, not just `safety_score`.
- The Netlify frontend can run in demo mode until the Render backend is live.
