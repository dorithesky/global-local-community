import re
import unicodedata
from typing import Iterable

GENERIC_TOKENS = {
    'inc', 'llc', 'co', 'company', 'corp', 'group', 'labs', 'technologies',
    'technology', 'tech', 'systems', 'holdings', 'limited', 'ltd'
}


def ascii_fold(text: str) -> str:
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')


def normalize_text(text: str) -> str:
    text = ascii_fold(text.lower().replace('&', ' and '))
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def collapse_text(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', ascii_fold(text.lower().replace('&', ' and ')))


def tokenize(text: str) -> list[str]:
    return [token for token in normalize_text(text).split() if token and token not in GENERIC_TOKENS]


def canonical_token_signature(text: str) -> str:
    return ' '.join(sorted(set(tokenize(text))))


def has_target_class(classes: Iterable[int]) -> bool:
    targets = {9, 35, 42}
    return bool(targets & {int(c) for c in classes})
