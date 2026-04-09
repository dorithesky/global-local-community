# Brand Safety Service

Python microservice for early-stage brand screening.

## What it does
- accepts a `brand_name` and `industry_keywords`
- infers relevant NICE classes from the industry keywords
- concurrently checks:
  - trademark conflicts using USPTO-oriented search data with fuzzy and phonetic matching
  - DNS resolution for `.com`, `.ai`, and `.io`
- returns JSON with:
  - `safety_score`
  - `digital_availability`
  - `trademark_conflicts`

## Run
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

## Request
```bash
curl -X POST http://127.0.0.1:8000/brand-check \
  -H 'content-type: application/json' \
  -d '{
    "brand_name": "Clawbot",
    "industry_keywords": ["ai", "saas", "automation"]
  }'
```

## Response shape
```json
{
  "brand_name": "Clawbot",
  "relevant_nice_classes": [9, 42],
  "safety_score": 74,
  "digital_availability": {
    "clawbot.com": false,
    "clawbot.ai": true,
    "clawbot.io": true
  },
  "trademark_conflicts": [],
  "notes": []
}
```

## Notes
- Safety scoring is heuristic only, not legal advice.
- DNS checks are not the same as registrar availability checks.
- USPTO access in this version uses a practical fallback search endpoint and local fuzzy scoring.
