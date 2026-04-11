import sqlite3
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from metaphone import doublemetaphone

ROOT = Path('/Users/scottmoon/.openclaw/workspace/brand-safety-service')
DB_PATH = ROOT / 'data' / 'trademarks.db'
SCHEMA_PATH = ROOT / 'trademark_schema.sql'
ZIP_PATH = ROOT / 'data' / 'raw' / 'uspto' / 'daily' / 'apc260410.zip'
EXTRACT_PATH = ROOT / 'data' / 'raw' / 'uspto' / 'daily' / 'apc260410.xml'
TARGET_CLASSES = {9, 35, 42}
LIMIT = 10000


def normalize_text(text: str) -> str:
    import re
    text = text.lower().replace('&', ' and ')
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def collapse_text(text: str) -> str:
    import re
    return re.sub(r'[^a-z0-9]', '', text.lower().replace('&', ' and '))


def ensure_xml() -> Path:
    if EXTRACT_PATH.exists():
        return EXTRACT_PATH
    with zipfile.ZipFile(ZIP_PATH) as zf:
        member = next(name for name in zf.namelist() if name.lower().endswith('.xml'))
        with zf.open(member) as src, open(EXTRACT_PATH, 'wb') as dst:
            dst.write(src.read())
    return EXTRACT_PATH


def ensure_schema(conn):
    conn.executescript(SCHEMA_PATH.read_text())
    conn.commit()


def phonetics(text: str):
    primary, secondary = doublemetaphone(collapse_text(text))
    return primary or '', secondary or ''


def upsert(conn, rec):
    conn.execute(
        """
        INSERT INTO trademarks (
          source_row_id, mark_text, mark_normalized, mark_compact,
          mark_phonetic_primary, mark_phonetic_secondary, owner_name,
          status_label, is_active, is_registered,
          serial_number, registration_number, filing_date, registration_date,
          status_date, goods_services, goods_services_normalized,
          primary_nice_class, class_9, class_35, class_42, last_seen_at
        ) VALUES (
          :source_row_id, :mark_text, :mark_normalized, :mark_compact,
          :mark_phonetic_primary, :mark_phonetic_secondary, :owner_name,
          :status_label, :is_active, :is_registered,
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
        rec,
    )


def text_of(elem, path):
    found = elem.find(path)
    return (found.text or '').strip() if found is not None and found.text else None


def gather_classes(case_file):
    classes = []
    for node in case_file.findall('./classifications/classification/international-code'): 
        text = (node.text or '').strip()
        if text.isdigit():
            classes.append(int(text))
    return sorted(set(classes))


def main():
    xml_path = ensure_xml()
    context = ET.iterparse(str(xml_path), events=('end',))
    loaded = 0
    skipped = 0
    with sqlite3.connect(DB_PATH) as conn:
        ensure_schema(conn)
        for _, elem in context:
            if not elem.tag.lower().endswith('case-file'):
                continue
            serial = text_of(elem, './serial-number')
            registration = text_of(elem, './registration-number')
            mark = text_of(elem, './case-file-header/mark-identification')
            status_code = text_of(elem, './case-file-header/status-code')
            status_date = text_of(elem, './case-file-header/status-date')
            filing_date = text_of(elem, './case-file-header/filing-date')
            registration_date = text_of(elem, './case-file-header/registration-date')
            goods_parts = []
            for node in elem.findall('./goods-services/goods-services-statement'): 
                txt = ''.join(node.itertext()).strip()
                if txt:
                    goods_parts.append(txt)
            owner = None
            owner_node = elem.find('./case-file-owners/case-file-owner/party-name')
            if owner_node is not None and owner_node.text:
                owner = owner_node.text.strip()
            classes = gather_classes(elem)
            if not mark or not (TARGET_CLASSES & set(classes)):
                skipped += 1
                elem.clear()
                continue
            primary, secondary = phonetics(mark)
            goods = ' '.join(goods_parts)
            rec = {
                'source_row_id': f"xml:{serial or registration or mark}",
                'mark_text': mark,
                'mark_normalized': normalize_text(mark),
                'mark_compact': collapse_text(mark),
                'mark_phonetic_primary': primary,
                'mark_phonetic_secondary': secondary,
                'owner_name': owner,
                'status_label': status_code,
                'is_active': 0 if str(status_code or '').lower() in {'dead','abandoned','cancelled','expired'} else 1,
                'is_registered': 1 if registration else 0,
                'serial_number': serial,
                'registration_number': registration,
                'filing_date': filing_date,
                'registration_date': registration_date,
                'status_date': status_date,
                'goods_services': goods,
                'goods_services_normalized': normalize_text(goods),
                'primary_nice_class': classes[0] if classes else None,
                'class_9': 1 if 9 in classes else 0,
                'class_35': 1 if 35 in classes else 0,
                'class_42': 1 if 42 in classes else 0,
                'last_seen_at': datetime.now(timezone.utc).isoformat(),
            }
            upsert(conn, rec)
            loaded += 1
            if loaded >= LIMIT:
                break
            if loaded % 200 == 0:
                conn.commit()
            elem.clear()
        conn.commit()
        total = conn.execute('SELECT COUNT(*) FROM trademarks').fetchone()[0]
    print({'loaded': loaded, 'skipped': skipped, 'total': total})


if __name__ == '__main__':
    main()
