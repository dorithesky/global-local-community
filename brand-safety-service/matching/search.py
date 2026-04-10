import sqlite3
from pathlib import Path

from metaphone import doublemetaphone

from etl.normalize import collapse_text, normalize_text, tokenize
from matching.scoring import final_score

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / 'data' / 'trademarks.db'


def phonetic_values(text: str) -> set[str]:
    values = set()
    primary, secondary = doublemetaphone(collapse_text(text))
    if primary:
        values.add(primary)
    if secondary:
        values.add(secondary)
    return values


def tokenize_for_fts(text: str) -> str:
    tokens = tokenize(text)
    if not tokens:
        base = normalize_text(text)
        return f'"{base}"*' if base else ''
    return ' OR '.join(f'"{token}"*' for token in tokens)


def fetch_candidates(query: str, limit: int = 100) -> list[dict]:
    if not DB_PATH.exists():
        return []
    collapsed = collapse_text(query)
    normalized = normalize_text(query)
    phonetics = tuple(phonetic_values(query))
    fts_query = tokenize_for_fts(query)

    phonetic_placeholders = ','.join('?' for _ in phonetics) if phonetics else "''"
    sql = """
    SELECT DISTINCT t.*
    FROM trademarks t
    LEFT JOIN (
      SELECT rowid FROM trademarks_fts WHERE trademarks_fts MATCH ?
    ) f ON f.rowid = t.id
    WHERE (
      t.mark_compact = ?
      OR t.mark_normalized = ?
      OR t.mark_phonetic_primary IN ({phonetic_placeholders})
      OR t.mark_phonetic_secondary IN ({phonetic_placeholders})
      OR f.rowid IS NOT NULL
      OR t.mark_compact LIKE ?
    )
    ORDER BY t.is_active DESC, t.updated_at DESC
    LIMIT ?
    """.format(phonetic_placeholders=phonetic_placeholders)

    params = [fts_query or '']
    params.extend([collapsed, normalized])
    if phonetics:
        params.extend(list(phonetics))
        params.extend(list(phonetics))
    params.extend([f'%{collapsed}%', limit])

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(sql, params).fetchall()

    results = []
    for row in rows:
        record = dict(row)
        scores = final_score(query, record['mark_text'])
        record['match_scores'] = {
            'phonetic': scores.phonetic,
            'edit': scores.edit,
            'token': scores.token,
            'final': scores.final,
        }
        results.append(record)

    results.sort(key=lambda item: (item['is_active'], item['match_scores']['final']), reverse=True)
    return results
