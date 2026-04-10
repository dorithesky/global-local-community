from dataclasses import dataclass

from rapidfuzz import fuzz
from rapidfuzz.distance import Levenshtein
from metaphone import doublemetaphone

from etl.normalize import collapse_text, normalize_text, tokenize

SPLIT_JOIN_EQUIVALENTS = {
    ('sales', 'force'): 'salesforce',
    ('mail', 'chimp'): 'mailchimp',
    ('drop', 'box'): 'dropbox',
    ('air', 'table'): 'airtable',
    ('mid', 'journey'): 'midjourney',
    ('snow', 'flake'): 'snowflake',
    ('data', 'dog'): 'datadog',
    ('claw', 'bot'): 'clawbot',
}


@dataclass
class MatchScores:
    phonetic: float
    edit: float
    token: float
    final: float


def phonetic_codes(text: str) -> set[str]:
    codes: set[str] = set()
    parts = [collapse_text(text), *tokenize(text)]
    for part in parts:
        if not part:
            continue
        primary, secondary = doublemetaphone(part)
        if primary:
            codes.add(primary)
        if secondary:
            codes.add(secondary)
        if part.startswith('k'):
            k_primary, k_secondary = doublemetaphone('c' + part[1:])
            if k_primary:
                codes.add(k_primary)
            if k_secondary:
                codes.add(k_secondary)
        if part.startswith('c'):
            c_primary, c_secondary = doublemetaphone('k' + part[1:])
            if c_primary:
                codes.add(c_primary)
            if c_secondary:
                codes.add(c_secondary)
    return codes


def enrich_tokens(tokens: list[str]) -> set[str]:
    enriched = set(tokens)
    for parts, joined in SPLIT_JOIN_EQUIVALENTS.items():
        if all(part in enriched for part in parts):
            enriched.add(joined)
    return enriched


def phonetic_score(query: str, candidate: str) -> float:
    q_collapsed = collapse_text(query)
    c_collapsed = collapse_text(candidate)
    q_full = {code for code in doublemetaphone(q_collapsed) if code}
    c_full = {code for code in doublemetaphone(c_collapsed) if code}
    if q_full & c_full:
        return 1.0
    q_tokens = phonetic_codes(query)
    c_tokens = phonetic_codes(candidate)
    if q_collapsed.startswith(c_collapsed) or c_collapsed.startswith(q_collapsed):
        if min(len(q_collapsed), len(c_collapsed)) >= 5:
            return max(0.88, 1.0 if q_collapsed == c_collapsed else 0.88)
    union = max(1, len(q_tokens | c_tokens))
    overlap = len(q_tokens & c_tokens)
    if overlap == 0:
        collapsed_ratio = fuzz.ratio(q_collapsed, c_collapsed) / 100
        if collapsed_ratio >= 0.9:
            return 0.82
        if collapsed_ratio >= 0.75:
            return 0.68
        return 0.0
    return max(0.75 * (overlap / union), 0.82 if overlap and (fuzz.ratio(q_collapsed, c_collapsed) / 100) >= 0.9 else 0.0)


def edit_score(query: str, candidate: str) -> float:
    q2 = collapse_text(query)
    c2 = collapse_text(candidate)
    if not q2 or not c2:
        return 0.0
    ratio = fuzz.ratio(q2, c2) / 100
    norm = 1 - Levenshtein.distance(q2, c2) / max(len(q2), len(c2), 1)
    return max(ratio, norm)


def token_score(query: str, candidate: str) -> float:
    qn = normalize_text(query)
    cn = normalize_text(candidate)
    ratio = fuzz.token_set_ratio(qn, cn) / 100
    qt = enrich_tokens(tokenize(qn))
    ct = enrich_tokens(tokenize(cn))
    if not qt and not ct:
        return ratio
    if qt == ct:
        return 1.0
    jaccard = len(qt & ct) / max(len(qt | ct), 1)
    if len(qt & ct) == 1 and max(len(qt), len(ct)) > 1:
        jaccard = min(jaccard, 0.45)
    collapsed_ratio = fuzz.ratio(collapse_text(query), collapse_text(candidate)) / 100
    return max(ratio, jaccard, collapsed_ratio)


def final_score(query: str, candidate: str) -> MatchScores:
    p = phonetic_score(query, candidate)
    e = edit_score(query, candidate)
    t = token_score(query, candidate)
    score = 0.45 * p + 0.35 * e + 0.20 * t
    q_collapsed = collapse_text(query)
    c_collapsed = collapse_text(candidate)
    if q_collapsed == c_collapsed:
        score += 0.08
    if q_collapsed.startswith(c_collapsed) or c_collapsed.startswith(q_collapsed):
        if min(len(q_collapsed), len(c_collapsed)) >= 5:
            score += 0.05
    if edit_score(query, candidate) >= 0.9 and token_score(query, candidate) >= 0.9:
        score += 0.05
    if len(q_collapsed) > 0 and len(c_collapsed) > 0:
        longer = max(len(q_collapsed), len(c_collapsed))
        shorter = min(len(q_collapsed), len(c_collapsed))
        if shorter and longer / shorter > 2 and p < 1.0:
            score -= 0.12
    score = max(0.0, min(score, 1.0))
    return MatchScores(phonetic=p, edit=e, token=t, final=score)
