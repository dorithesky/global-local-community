PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS trademarks (
  id INTEGER PRIMARY KEY,
  source_system TEXT NOT NULL DEFAULT 'USPTO',
  source_row_id TEXT NOT NULL UNIQUE,
  mark_text TEXT NOT NULL,
  mark_normalized TEXT NOT NULL,
  mark_compact TEXT NOT NULL,
  mark_phonetic_primary TEXT,
  mark_phonetic_secondary TEXT,
  owner_name TEXT,
  status_code TEXT,
  status_label TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_registered INTEGER NOT NULL DEFAULT 0,
  serial_number TEXT,
  registration_number TEXT,
  filing_date TEXT,
  registration_date TEXT,
  status_date TEXT,
  goods_services TEXT,
  goods_services_normalized TEXT,
  primary_nice_class INTEGER,
  class_9 INTEGER NOT NULL DEFAULT 0,
  class_35 INTEGER NOT NULL DEFAULT 0,
  class_42 INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trademark_classes (
  trademark_id INTEGER NOT NULL,
  nice_class INTEGER NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (trademark_id) REFERENCES trademarks(id),
  UNIQUE (trademark_id, nice_class)
);

CREATE VIRTUAL TABLE IF NOT EXISTS trademarks_fts USING fts5(
  mark_text,
  mark_normalized,
  mark_compact,
  goods_services_normalized,
  content='trademarks',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE INDEX IF NOT EXISTS idx_trademarks_mark_compact ON trademarks(mark_compact);
CREATE INDEX IF NOT EXISTS idx_trademarks_mark_normalized ON trademarks(mark_normalized);
CREATE INDEX IF NOT EXISTS idx_trademarks_mark_phonetic_primary ON trademarks(mark_phonetic_primary);
CREATE INDEX IF NOT EXISTS idx_trademarks_mark_phonetic_secondary ON trademarks(mark_phonetic_secondary);
CREATE INDEX IF NOT EXISTS idx_trademarks_active ON trademarks(is_active);
CREATE INDEX IF NOT EXISTS idx_trademarks_serial ON trademarks(serial_number);
CREATE INDEX IF NOT EXISTS idx_trademarks_registration ON trademarks(registration_number);
CREATE INDEX IF NOT EXISTS idx_trademark_classes_class ON trademark_classes(nice_class);
CREATE INDEX IF NOT EXISTS idx_trademarks_class_flags ON trademarks(class_9, class_35, class_42, is_active);

CREATE TRIGGER IF NOT EXISTS trademarks_ai AFTER INSERT ON trademarks BEGIN
  INSERT INTO trademarks_fts(rowid, mark_text, mark_normalized, mark_compact, goods_services_normalized)
  VALUES (new.id, new.mark_text, new.mark_normalized, new.mark_compact, new.goods_services_normalized);
END;

CREATE TRIGGER IF NOT EXISTS trademarks_ad AFTER DELETE ON trademarks BEGIN
  INSERT INTO trademarks_fts(trademarks_fts, rowid, mark_text, mark_normalized, mark_compact, goods_services_normalized)
  VALUES('delete', old.id, old.mark_text, old.mark_normalized, old.mark_compact, old.goods_services_normalized);
END;

CREATE TRIGGER IF NOT EXISTS trademarks_au AFTER UPDATE ON trademarks BEGIN
  INSERT INTO trademarks_fts(trademarks_fts, rowid, mark_text, mark_normalized, mark_compact, goods_services_normalized)
  VALUES('delete', old.id, old.mark_text, old.mark_normalized, old.mark_compact, old.goods_services_normalized);
  INSERT INTO trademarks_fts(rowid, mark_text, mark_normalized, mark_compact, goods_services_normalized)
  VALUES (new.id, new.mark_text, new.mark_normalized, new.mark_compact, new.goods_services_normalized);
END;
