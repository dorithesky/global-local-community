from dataclasses import dataclass

from rapidfuzz import fuzz
from rapidfuzz.distance import Levenshtein
from metaphone import doublemetaphone

from etl.normalize import collapse_text, normalize_text, tokenize


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
    return codes


def phonetic_score(query: str, candidate: str) -> float:
    q_full = {code for code in doublemetaphone(collapse_text(query)) if code}
    c_full = {code for code in doublemetaphone(collapse_text(candidate)) if code}
    if q_full & c_full:
        return 1.0
    q_tokens = phonetic_codes(query)
    c_tokens = phonetic_codes(candidate)
    union = max(1, len(q_tokens | c_tokens))
    overlap = len(q_tokens & c_tokens)
    if overlap == 0:
        return 0.0
    return 0.75 * (overlap / union)


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
    qt = set(tokenize(qn))
    ct = set(tokenize(cn))
    if not qt and not ct:
        return ratio
    jaccard = len(qt & ct) / max(len(qt | ct), 1)
    return max(ratio, jaccard)


def final_score(query: str, candidate: str) -> MatchScores:
    p = phonetic_score(query, candidate)
    e = edit_score(query, candidate)
    t = token_score(query, candidate)
    score = 0.45 * p + 0.35 * e + 0.20 * t
    if collapse_text(query) == collapse_text(candidate):
        score += 0.08
    if len(collapse_text(query)) > 0 and len(collapse_text(candidate)) > 0:
        longer = max(len(collapse_text(query)), len(collapse_text(candidate)))
        shorter = min(len(collapse_text(query)), len(collapse_text(candidate)))
        if shorter and longer / shorter > 2 and p < 1.0:
            score -= 0.12
    score = max(0.0, min(score, 1.0))
    return MatchScores(phonetic=p, edit=e, token=t, final=score)
