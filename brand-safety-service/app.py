from __future__ import annotations

import asyncio
import os
import re
from difflib import SequenceMatcher
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Brand Guard & Domain Scout", version="0.3.0")

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USPTO_API_FALLBACK_URL = os.getenv("USPTO_API_FALLBACK_URL", "https://api.markbase.co/v1/search")
DOMAIN_SUFFIXES = ["com", "ai", "io", "co"]
NICE_CLASS_HINTS = {
    "software": [9, 42],
    "saas": [9, 42],
    "ai": [9, 42],
    "automation": [9, 42],
    "agent": [9, 42],
    "finance": [36],
    "fintech": [36],
    "payments": [36],
    "health": [5, 10, 44],
    "biotech": [5, 42],
    "education": [16, 41],
    "media": [9, 38, 41],
    "ecommerce": [35, 42],
    "consumer": [35],
    "gaming": [9, 41],
    "security": [9, 42, 45],
}
PREFIXES = ["get", "try", "use"]
SUFFIXES = ["labs", "hq", "app", "ai", "works"]


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
    active: bool
    conflict_type: str


class DomainStatus(BaseModel):
    domain: str
    status: str


class SuggestedVariation(BaseModel):
    candidate: str
    risk_level: str
    digital_availability: dict[str, str]


class LaunchReadinessReport(BaseModel):
    summary: str
    recommendation: str
    requires_legal_review: bool
    requires_registrar_check: bool


class BrandCheckResponse(BaseModel):
    brand_name: str
    relevant_nice_classes: list[int]
    risk_level: str
    safety_score: int
    confidence_level: str
    blocking_reasons: list[str]
    digital_availability: dict[str, str]
    registrar_availability_verified: bool
    trademark_conflicts: list[TrademarkHit]
    launch_readiness_report: LaunchReadinessReport
    suggested_variations: list[SuggestedVariation]
    notes: list[str]


class DomainLookupResult(BaseModel):
    domain: str
    status: str


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
        ("c", "k"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    deduped = [text[0]]
    for ch in text[1:]:
        if ch != deduped[-1]:
            deduped.append(ch)
    no_vowels = deduped[0] + "".join(ch for ch in deduped[1:] if ch not in "aeiouy")
    return no_vowels[:10]


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
        classes.update({9, 42})
    return sorted(classes)


def is_active_status(status: str | None) -> bool:
    if not status:
        return True
    lowered = status.lower()
    return not any(word in lowered for word in ["dead", "cancelled", "abandoned", "expired"])


async def fetch_trademark_candidates(client: httpx.AsyncClient, query: str, nice_classes: list[int]) -> list[dict[str, Any]]:
    params = {"q": query, "classes": ",".join(map(str, nice_classes)), "limit": 25}
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


async def query_trademarks(client: httpx.AsyncClient, brand_name: str, nice_classes: list[int]) -> list[TrademarkHit]:
    conflicts: list[TrademarkHit] = []
    queries = {brand_name, normalize_brand(brand_name), simple_phonetic(brand_name)}
    raw_results = await asyncio.gather(*(fetch_trademark_candidates(client, q, nice_classes) for q in queries if q))
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
            if not overlap:
                continue

            direct = similarity(brand_name, mark)
            phon = phonetic_similarity(brand_name, mark)
            score = max(direct, phon * 0.97)
            if score < 0.68:
                continue

            active = is_active_status(item.get("status"))
            conflict_type = "direct_match" if direct >= 0.92 else "likelihood_of_confusion"
            conflicts.append(
                TrademarkHit(
                    mark=mark,
                    serial_number=item.get("serial_number") or item.get("serialNumber"),
                    registration_number=item.get("registration_number") or item.get("registrationNumber"),
                    status=item.get("status"),
                    classes=item_classes,
                    source="USPTO-oriented search",
                    similarity=round(direct, 3),
                    phonetic_similarity=round(phon, 3),
                    conflict_score=round(score, 3),
                    active=active,
                    conflict_type=conflict_type,
                )
            )
    conflicts.sort(key=lambda x: (x.active, x.conflict_score), reverse=True)
    return conflicts[:10]


async def check_domain(client: httpx.AsyncClient, domain: str) -> DomainLookupResult:
    dns_url = f"https://dns.google/resolve?name={domain}&type=A"
    try:
        response = await client.get(dns_url, timeout=10)
        response.raise_for_status()
        payload = response.json()
        answers = payload.get("Answer", [])
        if answers:
            return DomainLookupResult(domain=domain, status="Resolvable")
        return DomainLookupResult(domain=domain, status="Not Resolvable")
    except Exception:
        return DomainLookupResult(domain=domain, status="Unknown")


def compute_safety_score(conflicts: list[TrademarkHit]) -> int:
    if not conflicts:
        return 88
    active_conflicts = [c for c in conflicts if c.active]
    target = active_conflicts[0] if active_conflicts else conflicts[0]
    score = target.conflict_score
    if target.conflict_type == "direct_match" and target.active:
        return 10
    if score >= 0.93:
        return 15
    if score >= 0.86:
        return 28
    if score >= 0.79:
        return 42
    if score >= 0.72:
        return 58
    return 70


def risk_level_from_score(score: int) -> str:
    if score <= 35:
        return "High"
    if score <= 74:
        return "Medium"
    return "Low"


async def evaluate_candidate(client: httpx.AsyncClient, candidate: str, nice_classes: list[int]) -> SuggestedVariation:
    domains = [f"{normalize_brand(candidate)}.{suffix}" for suffix in DOMAIN_SUFFIXES]
    conflicts, *domain_results = await asyncio.gather(
        query_trademarks(client, candidate, nice_classes),
        *(check_domain(client, d) for d in domains),
    )
    score = compute_safety_score(conflicts)
    return SuggestedVariation(
        candidate=candidate,
        risk_level=risk_level_from_score(score),
        digital_availability={d.domain: d.status for d in domain_results},
    )


def build_variation_candidates(brand_name: str) -> list[str]:
    base = normalize_brand(brand_name)
    variants = []
    for prefix in PREFIXES:
        variants.append(f"{prefix}{base}")
    for suffix in SUFFIXES:
        variants.append(f"{base}{suffix}")
    variants.append(f"{base}hq")
    return variants[:8]


def build_report(brand_name: str, risk_level: str, conflicts: list[TrademarkHit], domains: dict[str, str]) -> LaunchReadinessReport:
    not_resolvable_count = sum(1 for status in domains.values() if status == "Not Resolvable")
    if risk_level == "High":
        recommendation = "Do not launch under this brand without legal review and likely renaming."
    elif risk_level == "Medium":
        recommendation = "Proceed carefully. Use a trademark attorney and verify registrars before launch."
    else:
        recommendation = "Early signal is usable, but still verify with a trademark attorney and registrar before committing."

    if conflicts:
        top = conflicts[0]
        summary = (
            f"{brand_name} has {risk_level.lower()} trademark risk. "
            f"Top hit: {top.mark} ({top.conflict_type}, score {top.conflict_score}). "
            f"{not_resolvable_count} of {len(domains)} core domains are currently not resolving in DNS."
        )
    else:
        summary = (
            f"{brand_name} has no strong trademark hits in the screened classes and "
            f"{not_resolvable_count} of {len(domains)} core domains are currently not resolving in DNS."
        )
    return LaunchReadinessReport(
        summary=summary,
        recommendation=recommendation,
        requires_legal_review=True,
        requires_registrar_check=True,
    )


@app.post("/brand-check", response_model=BrandCheckResponse)
async def brand_check(request: BrandCheckRequest) -> BrandCheckResponse:
    brand_name = request.brand_name.strip()
    if not brand_name:
        raise HTTPException(status_code=400, detail="brand_name is required")

    nice_classes = infer_nice_classes(request.industry_keywords)
    domains = [f"{normalize_brand(brand_name)}.{suffix}" for suffix in DOMAIN_SUFFIXES]

    async with httpx.AsyncClient(headers={"User-Agent": "brand-guard-domain-scout/0.2"}) as client:
        trademark_task = query_trademarks(client, brand_name, nice_classes)
        domain_tasks = [check_domain(client, domain) for domain in domains]
        conflicts, *domain_results = await asyncio.gather(trademark_task, *domain_tasks)

        domain_map = {result.domain: result.status for result in domain_results}
        safety_score = compute_safety_score(conflicts)
        risk_level = risk_level_from_score(safety_score)

        suggestions: list[SuggestedVariation] = []
        for candidate in build_variation_candidates(brand_name):
            suggestion = await evaluate_candidate(client, candidate, nice_classes)
            if suggestion.risk_level != "High":
                suggestions.append(suggestion)
            if len(suggestions) >= 5:
                break

    blocking_reasons: list[str] = ["registrar_unverified"]
    if any(c.active and c.conflict_type == "direct_match" for c in conflicts):
        risk_level = "High"
        safety_score = min(safety_score, 15)
        blocking_reasons.append("active_direct_match")
    elif any(c.active and c.conflict_score >= 0.72 for c in conflicts):
        if risk_level == "Low":
            risk_level = "Medium"
            safety_score = min(safety_score, 74)
        blocking_reasons.append("active_phonetic_or_fuzzy_conflict")

    if any(status == "Resolvable" for status in domain_map.values()):
        blocking_reasons.append("domain_not_confirmed_free")

    confidence_level = "Medium"
    if conflicts:
        confidence_level = "Medium"
    elif all(status in {"Resolvable", "Not Resolvable", "Unknown"} for status in domain_map.values()):
        confidence_level = "Medium"

    notes = [
        "Risk level should be treated as more important than safety score.",
        "Do not file, launch, or buy branding assets solely on this score.",
        "Trademark logic is a screening heuristic, not legal advice.",
        "Direct match and likelihood-of-confusion checks use fuzzy text similarity plus phonetic normalization.",
        "Domain status is DNS-based only. Registrar availability is not yet verified here.",
    ]

    return BrandCheckResponse(
        brand_name=brand_name,
        relevant_nice_classes=nice_classes,
        risk_level=risk_level,
        safety_score=safety_score,
        confidence_level=confidence_level,
        blocking_reasons=sorted(set(blocking_reasons)),
        digital_availability=domain_map,
        registrar_availability_verified=False,
        trademark_conflicts=conflicts,
        launch_readiness_report=build_report(brand_name, risk_level, conflicts, domain_map),
        suggested_variations=suggestions,
        notes=notes,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
