from __future__ import annotations

import asyncio
import os
import re
from difflib import SequenceMatcher
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Brand Safety Service", version="0.1.0")

USPTO_SEARCH_URL = os.getenv("USPTO_SEARCH_URL", "https://tmsearch.uspto.gov/search/public/search/results")
USPTO_API_FALLBACK_URL = os.getenv("USPTO_API_FALLBACK_URL", "https://api.markbase.co/v1/search")
DOMAIN_SUFFIXES = ["com", "ai", "io"]
NICE_CLASS_HINTS = {
    "software": [9, 42],
    "saas": [9, 42],
    "ai": [9, 42],
    "finance": [36],
    "fintech": [36],
    "health": [5, 10, 44],
    "biotech": [5, 42],
    "education": [16, 41],
    "media": [9, 38, 41],
    "ecommerce": [35, 42],
    "consumer": [35],
    "gaming": [9, 41],
    "security": [9, 42, 45],
}


class BrandCheckRequest(BaseModel):
    brand_name: str = Field(..., min_length=2)
    industry_keywords: list[str] = Field(default_factory=list)


class TrademarkHit(BaseModel):
    mark: str
    serial_number: str | None = None
    registration_number: str | None = None
    status: str | None = None
    classes: list[int] = Field(default_factory=list)
    source: str
    similarity: float
    phonetic_similarity: float
    conflict_score: float


class BrandCheckResponse(BaseModel):
    brand_name: str
    relevant_nice_classes: list[int]
    safety_score: int
    digital_availability: dict[str, bool | None]
    trademark_conflicts: list[TrademarkHit]
    notes: list[str]


class DomainResult(BaseModel):
    domain: str
    available: bool | None


def normalize_brand(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


def simple_phonetic(text: str) -> str:
    text = normalize_brand(text)
    if not text:
        return ""
    replacements = [
        ("ph", "f"),
        ("ck", "k"),
        ("qu", "k"),
        ("x", "ks"),
        ("z", "s"),
        ("v", "f"),
        ("dg", "j"),
        ("tion", "shun"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    deduped = [text[0]]
    for ch in text[1:]:
        if ch != deduped[-1]:
            deduped.append(ch)
    no_vowels = deduped[0] + "".join(ch for ch in deduped[1:] if ch not in "aeiouy")
    return no_vowels[:8]


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_brand(a), normalize_brand(b)).ratio()


def phonetic_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, simple_phonetic(a), simple_phonetic(b)).ratio()


def infer_nice_classes(keywords: list[str]) -> list[int]:
    classes: set[int] = set()
    for keyword in keywords:
        for token in re.findall(r"[a-z0-9]+", keyword.lower()):
            classes.update(NICE_CLASS_HINTS.get(token, []))
    if not classes:
        classes.update({9, 35, 42})
    return sorted(classes)


async def query_trademarks(client: httpx.AsyncClient, brand_name: str, nice_classes: list[int]) -> list[TrademarkHit]:
    conflicts: list[TrademarkHit] = []
    queries = {brand_name}
    compact = normalize_brand(brand_name)
    if compact and compact != brand_name:
        queries.add(compact)

    async def fetch(query: str) -> list[dict[str, Any]]:
        params = {"q": query, "classes": ",".join(map(str, nice_classes)), "limit": 20}
        try:
            response = await client.get(USPTO_API_FALLBACK_URL, params=params, timeout=20)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, dict):
                return data.get("results", data.get("items", []))
            if isinstance(data, list):
                return data
        except Exception:
            return []
        return []

    raw_results = await asyncio.gather(*(fetch(q) for q in queries))
    seen: set[str] = set()
    for result_set in raw_results:
        for item in result_set:
            mark = item.get("mark") or item.get("name") or item.get("trademark") or ""
            if not mark:
                continue
            key = f"{mark}:{item.get('serial_number') or item.get('serialNumber') or ''}"
            if key in seen:
                continue
            seen.add(key)
            item_classes = [int(c) for c in item.get("classes", item.get("international_classes", [])) if str(c).isdigit()]
            overlap = bool(set(item_classes) & set(nice_classes)) or not item_classes
            sim = similarity(brand_name, mark)
            psim = phonetic_similarity(brand_name, mark)
            score = max(sim, psim * 0.95)
            if overlap and score >= 0.68:
                conflicts.append(
                    TrademarkHit(
                        mark=mark,
                        serial_number=item.get("serial_number") or item.get("serialNumber"),
                        registration_number=item.get("registration_number") or item.get("registrationNumber"),
                        status=item.get("status"),
                        classes=item_classes,
                        source="USPTO/Markbase fallback",
                        similarity=round(sim, 3),
                        phonetic_similarity=round(psim, 3),
                        conflict_score=round(score, 3),
                    )
                )
    conflicts.sort(key=lambda x: x.conflict_score, reverse=True)
    return conflicts[:10]


async def check_domain(client: httpx.AsyncClient, domain: str) -> DomainResult:
    url = f"https://dns.google/resolve?name={domain}&type=A"
    try:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        payload = response.json()
        answers = payload.get("Answer", [])
        available = len(answers) == 0
        return DomainResult(domain=domain, available=available)
    except Exception:
        return DomainResult(domain=domain, available=None)


def compute_safety_score(conflicts: list[TrademarkHit]) -> int:
    if not conflicts:
        return 92
    highest = conflicts[0].conflict_score
    if highest >= 0.92:
        return 15
    if highest >= 0.85:
        return 30
    if highest >= 0.78:
        return 45
    if highest >= 0.72:
        return 60
    return 74


@app.post("/brand-check", response_model=BrandCheckResponse)
async def brand_check(request: BrandCheckRequest) -> BrandCheckResponse:
    brand_name = request.brand_name.strip()
    if not brand_name:
        raise HTTPException(status_code=400, detail="brand_name is required")

    nice_classes = infer_nice_classes(request.industry_keywords)
    domains = [f"{normalize_brand(brand_name)}.{suffix}" for suffix in DOMAIN_SUFFIXES]

    async with httpx.AsyncClient(headers={"User-Agent": "brand-safety-service/0.1"}) as client:
        trademark_task = query_trademarks(client, brand_name, nice_classes)
        domain_tasks = [check_domain(client, domain) for domain in domains]
        trademark_conflicts, *domain_results = await asyncio.gather(trademark_task, *domain_tasks)

    safety_score = compute_safety_score(trademark_conflicts)
    digital_availability = {result.domain: result.available for result in domain_results}
    notes = [
        "Safety Score is heuristic, not legal advice.",
        "Trademark search uses fuzzy string and phonetic matching against relevant NICE class hints.",
        "DNS availability indicates whether common A-record resolution exists, not guaranteed registrar availability.",
    ]
    return BrandCheckResponse(
        brand_name=brand_name,
        relevant_nice_classes=nice_classes,
        safety_score=safety_score,
        digital_availability=digital_availability,
        trademark_conflicts=trademark_conflicts,
        notes=notes,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
