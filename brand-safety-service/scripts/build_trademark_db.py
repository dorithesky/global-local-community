import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from metaphone import doublemetaphone

from etl.normalize import collapse_text, has_target_class, normalize_text

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / 'data' / 'trademarks.db'
SCHEMA_PATH = ROOT / 'trademark_schema.sql'
SAMPLE_PATH = ROOT / 'benchmark_harness' / 'sample_uspto_records.json'


def phonetic_primary_secondary(text: str):
    primary, secondary = doublemetaphone(collapse_text(text))
    return primary or '', secondary or ''


def parse_record(raw: dict) -> Optional[dict]:
    classes = [int(c) for c in raw.get('classes', []) if str(c).isdigit()]
    if not has_target_class(classes):
        return None
    mark = raw.get('mark_text') or raw.get('mark') or ''
    if not mark:
        return None
    primary, secondary = phonetic_primary_secondary(mark)
    normalized_goods = normalize_text(raw.get('goods_services', ''))
    return {
        'source_row_id': raw.get('source_row_id') or f"sample:{mark}:{raw.get('serial_number','')}",
        'mark_text': mark,
        'mark_normalized': normalize_text(mark),
        'mark_compact': collapse_text(mark),
        'mark_phonetic_primary': primary,
        'mark_phonetic_secondary': secondary,
        'owner_name': raw.get('owner_name'),
        'status_code': raw.get('status_code'),
        'status_label': raw.get('status_label'),
        'is_active': 0 if str(raw.get('status_label', '')).lower() in {'dead', 'abandoned', 'cancelled', 'expired'} else 1,
        'is_registered': 1 if raw.get('registration_number') else 0,
        'serial_number': raw.get('serial_number'),
        'registration_number': raw.get('registration_number'),
        'filing_date': raw.get('filing_date'),
        'registration_date': raw.get('registration_date'),
        'status_date': raw.get('status_date'),
        'goods_services': raw.get('goods_services', ''),
        'goods_services_normalized': normalized_goods,
        'primary_nice_class': classes[0] if classes else None,
        'class_9': 1 if 9 in classes else 0,
        'class_35': 1 if 35 in classes else 0,
        'class_42': 1 if 42 in classes else 0,
        'classes': classes,
        'last_seen_at': datetime.now(timezone.utc).isoformat(),
    }


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_PATH.read_text())
    conn.commit()


def upsert_record(conn: sqlite3.Connection, record: dict) -> None:
    conn.execute(
        """
        INSERT INTO trademarks (
          source_row_id, mark_text, mark_normalized, mark_compact,
          mark_phonetic_primary, mark_phonetic_secondary, owner_name,
          status_code, status_label, is_active, is_registered,
          serial_number, registration_number, filing_date, registration_date,
          status_date, goods_services, goods_services_normalized,
          primary_nice_class, class_9, class_35, class_42, last_seen_at
        ) VALUES (
          :source_row_id, :mark_text, :mark_normalized, :mark_compact,
          :mark_phonetic_primary, :mark_phonetic_secondary, :owner_name,
          :status_code, :status_label, :is_active, :is_registered,
          :serial_number, :registration_number, :filing_date, :registration_date,
          :status_date, :goods_services, :goods_services_normalized,
          :primary_nice_class, :class_9, :class_35, :class_42, :last_seen_at
        )
        ON CONFLICT(source_row_id) DO UPDATE SET
          mark_text=excluded.mark_text,
          mark_normalized=excluded.mark_normalized,
          mark_compact=excluded.mark_compact,
          mark_phonetic_primary=excluded.mark_phonetic_primary,
          mark_phonetic_secondary=excluded.mark_phonetic_secondary,
          owner_name=excluded.owner_name,
          status_code=excluded.status_code,
          status_label=excluded.status_label,
          is_active=excluded.is_active,
          is_registered=excluded.is_registered,
          serial_number=excluded.serial_number,
          registration_number=excluded.registration_number,
          filing_date=excluded.filing_date,
          registration_date=excluded.registration_date,
          status_date=excluded.status_date,
          goods_services=excluded.goods_services,
          goods_services_normalized=excluded.goods_services_normalized,
          primary_nice_class=excluded.primary_nice_class,
          class_9=excluded.class_9,
          class_35=excluded.class_35,
          class_42=excluded.class_42,
          last_seen_at=excluded.last_seen_at,
          updated_at=CURRENT_TIMESTAMP
        """,
        record,
    )
    trademark_id = conn.execute("SELECT id FROM trademarks WHERE source_row_id = ?", (record['source_row_id'],)).fetchone()[0]
    conn.execute("DELETE FROM trademark_classes WHERE trademark_id = ?", (trademark_id,))
    for idx, nice_class in enumerate(record['classes']):
        conn.execute(
            "INSERT INTO trademark_classes (trademark_id, nice_class, is_primary) VALUES (?, ?, ?)",
            (trademark_id, nice_class, 1 if idx == 0 else 0),
        )


def main() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    records = json.loads(SAMPLE_PATH.read_text())
    with sqlite3.connect(DB_PATH) as conn:
        init_db(conn)
        loaded = 0
        for raw in records:
            parsed = parse_record(raw)
            if not parsed:
                continue
            upsert_record(conn, parsed)
            loaded += 1
        conn.commit()
    print(json.dumps({'db_path': str(DB_PATH), 'loaded_records': loaded}, indent=2))


if __name__ == '__main__':
    main()
