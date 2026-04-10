import asyncio
import json
import sys

sys.path.insert(0, '/Users/scottmoon/.openclaw/workspace/brand-safety-service')

from app import BrandCheckRequest, brand_check


async def main() -> None:
    tests = [
        ('Ikea', ['consumer']),
        ('OpenAI', ['ai', 'software']),
        ('Canva', ['design', 'software']),
        ('Clawbot', ['ai', 'saas']),
    ]
    for name, keywords in tests:
        result = await brand_check(BrandCheckRequest(brand_name=name, industry_keywords=keywords))
        print(f'### {name}')
        print(json.dumps({
            'risk_level': result.risk_level,
            'confidence_level': result.confidence_level,
            'blocking_reasons': result.blocking_reasons,
            'top_conflict': result.trademark_conflicts[0].model_dump() if result.trademark_conflicts else None,
        }, indent=2))


if __name__ == '__main__':
    asyncio.run(main())
