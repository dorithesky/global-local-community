import argparse
import gzip
import json
import shutil
import sqlite3
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional

import requests
from metaphone import doublemetaphone

from etl.normalize import collapse_text, has_target_class, normalize_text

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / 'data' / 'trademarks.db'
SCHEMA_PATH = ROOT / 'trademark_schema.sql'
RAW_ROOT = ROOT / 'data' / 'raw' / 'uspto'
DEFAULT_SOURCES = {
    'annual': [
        'https://data.uspto.gov/bulkdata/datasets/trtdxfap/apc250101.zip',
    ],
    'daily': [
        'https://data.uspto.gov/bulkdata/datasets/trtdxfap/apc260409.zip',
    ],
}

REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
}


def phonetic_primary_secondary(text: str):
    primary, secondary = doublemetaphone(collapse_text(text))
    return primary or '', secondary or ''


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_PATH.read_text())
    conn.commit()


def download_file(url: str, dest: Path, max_attempts: int = 4) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    backoff = 2
    last_error: Optional[Exception] = None
    for attempt in range(1, max_attempts + 1):
        try:
            with session.get(url, headers=REQUEST_HEADERS, stream=True, timeout=90) as response:
                if response.status_code in {403, 503}:
                    raise RuntimeError(f'HTTP {response.status_code}')
                response.raise_for_status()
                with open(dest, 'wb') as out:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        if chunk:
                            out.write(chunk)
                return dest
        except Exception as exc:
            last_error = exc
            if attempt == max_attempts:
                break
            time.sleep(backoff)
            backoff *= 2
    raise RuntimeError(f'failed to download {url}: {last_error}')


def maybe_unpack(path: Path) -> Path:
    if path.suffix == '.gz':
        target = path.with_suffix('')
        with gzip.open(path, 'rb') as src, open(target, 'wb') as dst:
            shutil.copyfileobj(src, dst)
        return target
    return path


def iter_xml_records(xml_path: Path) -> Iterable[dict]:
    tree = ET.parse(xml_path)
    root = tree.getroot()
    for elem in root.iter():
        tag = elem.tag.lower()
        if tag.endswith('trademark') or tag.endswith('record') or tag.endswith('casefile'):
            mark = None
            serial = None
            registration = None
            status = None
            owner = None
            goods = None
            classes: list[int] = []
            for child in elem.iter():
                child_tag = child.tag.lower()
                text = (child.text or '').strip()
                if not text:
                    continue
                if mark is None and ('mark' in child_tag or 'literal' in child_tag) and len(text) < 200:
                    mark = text
                elif serial is None and 'serial' in child_tag:
                    serial = text
                elif registration is None and 'registration' in child_tag:
                    registration = text
                elif status is None and 'status' in child_tag:
                    status = text
                elif owner is None and ('owner' in child_tag or 'applicant' in child_tag):
                    owner = text
                elif goods is None and ('goods' in child_tag or 'services' in child_tag):
                    goods = text
                elif 'class' in child_tag and text.isdigit():
                    classes.append(int(text))
            if mark:
                yield {
                    'source_row_id': f"xml:{serial or registration or mark}",
                    'mark_text': mark,
                    'owner_name': owner,
                    'status_label': status,
                    'serial_number': serial,
                    'registration_number': registration,
                    'classes': sorted(set(classes)),
                    'goods_services': goods or '',
                    'filing_date': None,
                    'registration_date': None,
                    'status_date': None,
                }


def parse_record(raw: dict) -> Optional[dict]:
    classes = [int(c) for c in raw.get('classes', []) if str(c).isdigit()]
    if not has_target_class(classes):
        return None
    mark = raw.get('mark_text') or raw.get('mark') or ''
    if not mark:
        return None
    primary, secondary = phonetic_primary_secondary(mark)
    return {
        'source_row_id': raw.get('source_row_id') or f"bulk:{mark}:{raw.get('serial_number','')}",
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
        'goods_services_normalized': normalize_text(raw.get('goods_services', '')),
        'primary_nice_class': classes[0] if classes else None,
        'class_9': 1 if 9 in classes else 0,
        'class_35': 1 if 35 in classes else 0,
        'class_42': 1 if 42 in classes else 0,
        'classes': classes,
        'last_seen_at': datetime.now(timezone.utc).isoformat(),
    }


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
    trademark_id = conn.execute('SELECT id FROM trademarks WHERE source_row_id = ?', (record['source_row_id'],)).fetchone()[0]
    conn.execute('DELETE FROM trademark_classes WHERE trademark_id = ?', (trademark_id,))
    for idx, nice_class in enumerate(record['classes']):
        conn.execute(
            'INSERT INTO trademark_classes (trademark_id, nice_class, is_primary) VALUES (?, ?, ?)',
            (trademark_id, nice_class, 1 if idx == 0 else 0),
        )


def ingest_files(paths: list[Path]) -> dict:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    loaded = 0
    skipped = 0
    with sqlite3.connect(DB_PATH) as conn:
        ensure_schema(conn)
        for path in paths:
            xml_path = maybe_unpack(path)
            for raw in iter_xml_records(xml_path):
                parsed = parse_record(raw)
                if not parsed:
                    skipped += 1
                    continue
                upsert_record(conn, parsed)
                loaded += 1
        conn.commit()
    return {'db_path': str(DB_PATH), 'loaded_records': loaded, 'skipped_records': skipped}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', choices=['annual', 'daily', 'all'], default='all')
    parser.add_argument('--url', action='append', default=[])
    parser.add_argument('--local-file', action='append', default=[])
    args = parser.parse_args()

    targets: list[Path] = []
    for local_file in args.local_file:
        targets.append(Path(local_file))

    urls = list(args.url)
    if not urls:
        if args.source in {'annual', 'all'}:
            urls.extend(DEFAULT_SOURCES['annual'])
        if args.source in {'daily', 'all'}:
            urls.extend(DEFAULT_SOURCES['daily'])

    for url in urls:
        subdir = 'annual' if 'annual' in url or 'applications-2026' in url or 'registrations-2026' in url else 'daily'
        filename = url.rstrip('/').split('/')[-1]
        raw_path = RAW_ROOT / subdir / filename
        try:
            targets.append(download_file(url, raw_path))
        except Exception as exc:
            print(json.dumps({'url': url, 'error': str(exc)}))

    summary = ingest_files(targets)
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
