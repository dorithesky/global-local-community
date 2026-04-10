import asyncio
import os
import re
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from matching.search import fetch_candidates
from scripts.tsdr_bridge import fetch_tsdr_status

app = FastAPI(title="Brand Guard & Domain Scout", version="0.5.0")

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
GLOBAL_WATCHLIST = {
    "ikea",
    "google",
    "microsoft",
    "apple",
    "openai",
    "amazon",
    "meta",
    "netflix",
    "nike",
    "adidas",
    "tesla",
    "samsung",
}


class BrandCheckRequest(BaseModel):
    brand_name: str = Field(..., min_length=2)
    industry_keywords: list[str] = Field(default_factory=list)


class TrademarkHit(BaseModel):
    mark: str
    serial_number: Optional[str] = None
    registration_number: Optional[str] = None
    status: Optional[str] = None
    classes: list[int] = Field(default_factory=list)
    source: str
    similarity: float
    phonetic_similarity: float
    conflict_score: float
    active: bool
    conflict_type: str


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


class TrademarkQueryOutcome(BaseModel):
    conflicts: list[TrademarkHit]
    search_succeeded: bool
    sources_checked: list[str]
    watchlist_triggered: bool = False


def normalize_brand(text: str) -> str:
    text = text.lower().strip()
    text = text.replace("&", "and")
    text = re.sub(r"[^a-z0-9]", "", text)
    return text


def infer_nice_classes(keywords: list[str]) -> list[int]:
    classes: set[int] = set()
    for keyword in keywords:
        for token in re.findall(r"[a-z0-9]+", keyword.lower()):
            classes.update(NICE_CLASS_HINTS.get(token, []))
    if not classes:
        classes.update({9, 42})
    return sorted(classes)


def is_active_status(status: Optional[str]) -> bool:
    if not status:
        return True
    lowered = status.lower()
    return not any(word in lowered for word in ["dead", "cancelled", "abandoned", "expired"])


def build_watchlist_hit(brand_name: str) -> Optional[TrademarkHit]:
    normalized = normalize_brand(brand_name)
    if normalized not in GLOBAL_WATCHLIST:
        return None
    return TrademarkHit(
        mark=brand_name.strip(),
        status="Watchlist match",
        classes=[],
        source="Global brand watchlist",
        similarity=1.0,
        phonetic_similarity=1.0,
        conflict_score=0.995,
        active=True,
        conflict_type="direct_match",
    )


def classify_conflict(score: float) -> str:
    if score >= 0.96:
        return "direct_match"
    if score >= 0.88:
        return "near_direct_or_spacing_variant"
    return "likelihood_of_confusion"


async def maybe_verify_hits(conflicts: list[TrademarkHit]) -> list[TrademarkHit]:
    verified: list[TrademarkHit] = []
    for hit in conflicts[:3]:
        if hit.conflict_score < 0.9 and hit.conflict_type != "direct_match":
            verified.append(hit)
            continue
        tsdr = await fetch_tsdr_status(hit.serial_number, hit.registration_number)
        if tsdr.get("ok"):
            hit.status = tsdr.get("status") or hit.status
            hit.active = tsdr.get("active", hit.active)
            hit.source = "Local index + USPTO TSDR"
        verified.append(hit)
    if len(conflicts) > 3:
        verified.extend(conflicts[3:])
    return verified


async def query_trademarks(brand_name: str, nice_classes: list[int]) -> TrademarkQueryOutcome:
    watchlist_hit = build_watchlist_hit(brand_name)
    if watchlist_hit:
        return TrademarkQueryOutcome(
            conflicts=[watchlist_hit],
            search_succeeded=True,
            sources_checked=["global_watchlist"],
            watchlist_triggered=True,
        )

    candidates = fetch_candidates(brand_name, limit=50)
    conflicts: list[TrademarkHit] = []
    for item in candidates:
        score = float(item.get("match_scores", {}).get("final", 0.0))
        if score < 0.68:
            continue
        item_classes = []
        if item.get("class_9"):
            item_classes.append(9)
        if item.get("class_35"):
            item_classes.append(35)
        if item.get("class_42"):
            item_classes.append(42)
        class_overlap = bool(set(item_classes) & set(nice_classes)) or not item_classes
        if not class_overlap and score < 0.9:
            continue
        conflicts.append(
            TrademarkHit(
                mark=item["mark_text"],
                serial_number=item.get("serial_number"),
                registration_number=item.get("registration_number"),
                status=item.get("status_label"),
                classes=item_classes,
                source="Local trademark index",
                similarity=round(float(item.get("match_scores", {}).get("edit", 0.0)), 3),
                phonetic_similarity=round(float(item.get("match_scores", {}).get("phonetic", 0.0)), 3),
                conflict_score=round(score, 3),
                active=bool(item.get("is_active", 1)) and is_active_status(item.get("status_label")),
                conflict_type=classify_conflict(score),
            )
        )
    conflicts.sort(key=lambda x: (x.active, x.conflict_score), reverse=True)
    conflicts = await maybe_verify_hits(conflicts)
    return TrademarkQueryOutcome(
        conflicts=conflicts[:10],
        search_succeeded=bool(candidates),
        sources_checked=["local_index"],
        watchlist_triggered=False,
    )


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


def compute_safety_score(conflicts: list[TrademarkHit], trademark_search_succeeded: bool) -> int:
    if not trademark_search_succeeded:
        return 40
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


async def evaluate_candidate(client: httpx.AsyncClient, candidate: str, nice_classes: list[int], trademark_search_succeeded: bool) -> SuggestedVariation:
    domains = [f"{normalize_brand(candidate)}.{suffix}" for suffix in DOMAIN_SUFFIXES]
    trademark_outcome, *domain_results = await asyncio.gather(
        query_trademarks(candidate, nice_classes),
        *(check_domain(client, d) for d in domains),
    )
    score = compute_safety_score(trademark_outcome.conflicts, trademark_search_succeeded and trademark_outcome.search_succeeded)
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


def build_report(
    brand_name: str,
    risk_level: str,
    conflicts: list[TrademarkHit],
    domains: dict[str, str],
    trademark_search_succeeded: bool,
) -> LaunchReadinessReport:
    not_resolvable_count = sum(1 for status in domains.values() if status == "Not Resolvable")
    if risk_level == "High":
        recommendation = "Do not launch under this brand without legal review and likely renaming."
    elif risk_level == "Medium":
        recommendation = "Proceed carefully. Use a trademark attorney and verify registrars before launch."
    else:
        recommendation = "Early signal is usable, but still verify with a trademark attorney and registrar before committing."

    if not trademark_search_succeeded:
        summary = (
            f"Trademark search for {brand_name} was inconclusive, so this run is intentionally conservative. "
            f"{not_resolvable_count} of {len(domains)} core domains are currently not resolving in DNS."
        )
    elif conflicts:
        top = conflicts[0]
        summary = (
            f"{brand_name} has {risk_level.lower()} trademark risk. "
            f"Top hit: {top.mark} ({top.conflict_type}, score {top.conflict_score}). "
            f"{not_resolvable_count} of {len(domains)} core domains are currently not resolving in DNS."
        )
    else:
        summary = (
            f"{brand_name} has no strong trademark hits in the local trademark index and "
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

    async with httpx.AsyncClient(headers={"User-Agent": "brand-guard-domain-scout/0.5"}) as client:
        trademark_task = query_trademarks(brand_name, nice_classes)
        domain_tasks = [check_domain(client, domain) for domain in domains]
        trademark_outcome, *domain_results = await asyncio.gather(trademark_task, *domain_tasks)

        conflicts = trademark_outcome.conflicts
        domain_map = {result.domain: result.status for result in domain_results}
        trademark_search_succeeded = trademark_outcome.search_succeeded
        safety_score = compute_safety_score(conflicts, trademark_search_succeeded)
        risk_level = risk_level_from_score(safety_score)

        suggestions: list[SuggestedVariation] = []
        for candidate in build_variation_candidates(brand_name):
            suggestion = await evaluate_candidate(client, candidate, nice_classes, trademark_search_succeeded)
            if suggestion.risk_level != "High":
                suggestions.append(suggestion)
            if len(suggestions) >= 5:
                break

    blocking_reasons: list[str] = ["registrar_unverified"]
    if not trademark_search_succeeded:
        blocking_reasons.append("trademark_search_inconclusive")
        risk_level = "Medium"
        safety_score = min(safety_score, 40)
    if trademark_outcome.watchlist_triggered:
        blocking_reasons.append("global_brand_watchlist_match")
        risk_level = "High"
        safety_score = min(safety_score, 10)
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

    confidence_level = "Low" if not trademark_search_succeeded else "Medium"
    if trademark_outcome.watchlist_triggered or any(c.active and c.conflict_type == "direct_match" for c in conflicts):
        confidence_level = "High"

    notes = [
        "Risk level should be treated as more important than safety score.",
        "Do not file, launch, or buy branding assets solely on this score.",
        "Trademark logic is a screening heuristic, not legal advice.",
        "Primary trademark retrieval now uses the local trademark index, with optional TSDR verification for top hits.",
        "If trademark search is inconclusive, the result is intentionally prevented from showing a low-risk recommendation.",
        "A global famous-brand watchlist is used to prevent embarrassing false negatives on obvious marks.",
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
        launch_readiness_report=build_report(
            brand_name,
            risk_level,
            conflicts,
            domain_map,
            trademark_search_succeeded,
        ),
        suggested_variations=suggestions,
        notes=notes,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
