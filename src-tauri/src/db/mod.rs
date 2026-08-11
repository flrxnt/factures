use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

/// Single-writer SQLite connection, held in `tauri::State`. Every command
/// that touches the database locks this mutex for the duration of its
/// query — matches the "no async DB access pattern needed at this scale"
/// call made during the Phase 0 design.
pub struct DbState(pub Mutex<Connection>);

/// Additive schema, applied idempotently on every startup via
/// `CREATE TABLE IF NOT EXISTS`. Fine for a schema that only ever grows;
/// once a destructive change (column rename/drop) is needed, replace this
/// with a real versioned migration runner keyed off `schema_meta`.
const SCHEMA_SQL: &str = r#"
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT,
  purchase_price REAL,
  sale_price REAL NOT NULL DEFAULT 0,
  tax_rate_percent REAL NOT NULL DEFAULT 0,
  supplier_id TEXT REFERENCES contacts(id),
  low_stock_threshold REAL,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  doc_type TEXT NOT NULL,
  custom_type_label TEXT,
  document_number TEXT,
  name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date TEXT NOT NULL,
  due_date TEXT,
  currency TEXT NOT NULL,
  locale TEXT NOT NULL,
  default_tax_rate_percent REAL NOT NULL DEFAULT 0,
  seller_json TEXT NOT NULL,
  client_id TEXT REFERENCES contacts(id),
  client_json TEXT NOT NULL,
  discount_type TEXT,
  discount_value REAL,
  withholding_rate_percent REAL,
  notes TEXT,
  terms_and_conditions TEXT,
  payment_json TEXT,
  payment_link TEXT,
  signature_label TEXT,
  signature_image_data_url TEXT,
  footer_note_left TEXT,
  footer_note_right TEXT,
  visible_sections_json TEXT NOT NULL,
  manual_subtotal REAL,
  theme_color TEXT,
  template TEXT,
  warehouse_id TEXT REFERENCES warehouses(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_lines (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  product_id TEXT REFERENCES products(id),
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  tax_rate_percent REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS document_links (
  id TEXT PRIMARY KEY,
  source_document_id TEXT NOT NULL REFERENCES documents(id),
  target_document_id TEXT NOT NULL REFERENCES documents(id),
  relation TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
  movement_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_cost REAL,
  document_id TEXT REFERENCES documents(id),
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_lines_document_id ON document_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
"#;

pub fn open(app_data_dir: &Path) -> rusqlite::Result<Connection> {
    std::fs::create_dir_all(app_data_dir).ok();
    let db_path = app_data_dir.join("facture.db");
    let conn = Connection::open(db_path)?;
    conn.execute_batch(SCHEMA_SQL)?;
    Ok(conn)
}

pub fn get_meta(conn: &Connection, key: &str) -> rusqlite::Result<Option<String>> {
    conn.query_row("SELECT value FROM schema_meta WHERE key = ?1", [key], |row| row.get(0))
        .map(Some)
        .or_else(|err| if err == rusqlite::Error::QueryReturnedNoRows { Ok(None) } else { Err(err) })
}

pub fn set_meta(conn: &Connection, key: &str, value: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO schema_meta (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        rusqlite::params![key, value],
    )?;
    Ok(())
}
