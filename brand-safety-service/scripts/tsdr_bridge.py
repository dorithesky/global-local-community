import os
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

TSDR_BASE_URL = os.getenv('TSDR_BASE_URL', 'https://tsdrapi.uspto.gov/ts/cd')
TSDR_API_KEY = os.getenv('TSDR_API_KEY')


def normalize_active(status_text: str) -> bool:
    lowered = (status_text or '').lower()
    return not any(token in lowered for token in ['dead', 'abandoned', 'cancelled', 'expired'])


async def fetch_tsdr_status(serial_number: Optional[str] = None, registration_number: Optional[str] = None) -> dict[str, Any]:
    if not TSDR_API_KEY:
        return {'ok': False, 'error': 'missing_tsdr_api_key'}
    if not serial_number and not registration_number:
        return {'ok': False, 'error': 'missing_identifier'}

    if serial_number:
        url = f"{TSDR_BASE_URL}/status/sn{serial_number}/info.json"
    else:
        url = f"{TSDR_BASE_URL}/status/rn{registration_number}/info.json"

    headers = {'X-API-KEY': TSDR_API_KEY}
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        return {'ok': False, 'error': str(exc)}

    status_text = payload.get('status') or payload.get('prosecutionStatus') or ''
    return {
        'ok': True,
        'status': status_text,
        'active': normalize_active(status_text),
        'status_source': 'USPTO TSDR',
        'status_checked_at': datetime.now(timezone.utc).isoformat(),
        'raw': payload,
    }
