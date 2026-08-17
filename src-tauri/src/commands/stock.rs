use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::db::DbState;

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WarehouseDto {
    pub id: String,
    pub name: String,
    pub is_default: bool,
    pub archived_at: String,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StockMovementDto {
    pub id: String,
    pub product_id: String,
    pub warehouse_id: String,
    pub movement_type: String,
    pub quantity: f64,
    pub unit_cost: Option<f64>,
    pub document_id: Option<String>,
    pub note: String,
    pub created_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StockLevelDto {
    pub product_id: String,
    pub quantity: f64,
}

fn row_to_warehouse(row: &Row) -> rusqlite::Result<WarehouseDto> {
    Ok(WarehouseDto {
        id: row.get("id")?,
        name: row.get("name")?,
        is_default: row.get("is_default")?,
        archived_at: row.get("archived_at")?,
    })
}

fn row_to_movement(row: &Row) -> rusqlite::Result<StockMovementDto> {
    Ok(StockMovementDto {
        id: row.get("id")?,
        product_id: row.get("product_id")?,
        warehouse_id: row.get("warehouse_id")?,
        movement_type: row.get("movement_type")?,
        quantity: row.get("quantity")?,
        unit_cost: row.get("unit_cost")?,
        document_id: row.get("document_id")?,
        note: row.get("note")?,
        created_at: row.get("created_at")?,
    })
}

#[tauri::command]
pub fn save_warehouse(state: tauri::State<DbState>, warehouse: WarehouseDto) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    if warehouse.is_default {
        conn.execute("UPDATE warehouses SET is_default = 0 WHERE id != ?1", params![warehouse.id])
            .map_err(|e| e.to_string())?;
    }
    conn.execute(
        "INSERT INTO warehouses (id, name, is_default, archived_at) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_default=excluded.is_default, archived_at=excluded.archived_at",
        params![warehouse.id, warehouse.name, warehouse.is_default, warehouse.archived_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_warehouses(state: tauri::State<DbState>) -> Result<Vec<WarehouseDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM warehouses ORDER BY name COLLATE NOCASE ASC").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], row_to_warehouse).map_err(|e| e.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_warehouse(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM warehouses WHERE id = ?1", params![id]).map_err(|e| {
        if let rusqlite::Error::SqliteFailure(_, Some(message)) = &e {
            if message.contains("FOREIGN KEY") {
                return "Cet entrepôt a des mouvements de stock enregistrés — archivez-le plutôt que de le supprimer.".to_string();
            }
        }
        e.to_string()
    })?;
    Ok(())
}

#[tauri::command]
pub fn create_stock_movement(state: tauri::State<DbState>, movement: StockMovementDto) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR IGNORE INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity, unit_cost, document_id, note, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![
            movement.id,
            movement.product_id,
            movement.warehouse_id,
            movement.movement_type,
            movement.quantity,
            movement.unit_cost,
            movement.document_id,
            movement.note,
            movement.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_stock_movements(state: tauri::State<DbState>, product_id: Option<String>) -> Result<Vec<StockMovementDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    match product_id {
        Some(pid) => {
            let mut stmt = conn
                .prepare("SELECT * FROM stock_movements WHERE product_id = ?1 ORDER BY created_at DESC")
                .map_err(|e| e.to_string())?;
            let rows = stmt.query_map(params![pid], row_to_movement).map_err(|e| e.to_string())?;
            rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
        }
        None => {
            let mut stmt = conn.prepare("SELECT * FROM stock_movements ORDER BY created_at DESC").map_err(|e| e.to_string())?;
            let rows = stmt.query_map([], row_to_movement).map_err(|e| e.to_string())?;
            rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
pub fn get_stock_levels(state: tauri::State<DbState>) -> Result<Vec<StockLevelDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT product_id, SUM(CASE movement_type WHEN 'out' THEN -quantity ELSE quantity END) AS qty
             FROM stock_movements GROUP BY product_id",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| Ok(StockLevelDto { product_id: row.get(0)?, quantity: row.get(1)? }))
        .map_err(|e| e.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
}

const DEFAULT_WAREHOUSE_ID: &str = "default-warehouse";

/// Resolves the warehouse stock movements should be recorded against when
/// the caller doesn't specify one — the marked default, or the first
/// warehouse that exists, or a bootstrap "Entrepôt principal" created on the
/// spot if the user has never opened the Stock section at all.
fn resolve_default_warehouse(conn: &Connection) -> rusqlite::Result<String> {
    if let Some(id) = conn
        .query_row("SELECT id FROM warehouses WHERE is_default = 1 LIMIT 1", [], |row| row.get::<_, String>(0))
        .optional()?
    {
        return Ok(id);
    }
    if let Some(id) = conn.query_row("SELECT id FROM warehouses LIMIT 1", [], |row| row.get::<_, String>(0)).optional()? {
        return Ok(id);
    }
    conn.execute(
        "INSERT INTO warehouses (id, name, is_default, archived_at) VALUES (?1, 'Entrepôt principal', 1, '')",
        params![DEFAULT_WAREHOUSE_ID],
    )?;
    Ok(DEFAULT_WAREHOUSE_ID.to_string())
}

/// Called after an invoice is saved — a no-op unless the document is a
/// non-draft invoice whose line items haven't already been recorded (the
/// deterministic `stockmv-<document_id>-<line_index>` id makes re-running
/// this after every save naturally idempotent via INSERT OR IGNORE).
#[tauri::command]
pub fn apply_invoice_stock_movements(state: tauri::State<DbState>, document_id: String, created_at: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let doc: Option<(String, String)> = conn
        .query_row("SELECT doc_type, status FROM documents WHERE id = ?1", params![document_id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })
        .optional()
        .map_err(|e| e.to_string())?;

    let (doc_type, status) = match doc {
        Some(d) => d,
        None => return Ok(()),
    };
    if doc_type != "invoice" || status == "draft" {
        return Ok(());
    }

    let mut stmt = conn
        .prepare(
            "SELECT dl.id, dl.product_id, dl.quantity FROM document_lines dl
             JOIN products p ON p.id = dl.product_id
             WHERE dl.document_id = ?1 AND dl.product_id IS NOT NULL AND p.kind = 'good'",
        )
        .map_err(|e| e.to_string())?;
    let lines: Vec<(String, String, f64)> = stmt
        .query_map(params![document_id], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
        .map_err(|e| e.to_string())?
        .collect::<rusqlite::Result<_>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    if lines.is_empty() {
        return Ok(());
    }

    let warehouse_id = resolve_default_warehouse(&conn).map_err(|e| e.to_string())?;

    for (line_id, product_id, quantity) in lines {
        let movement_id = format!("stockmv-{}", line_id);
        conn.execute(
            "INSERT OR IGNORE INTO stock_movements (id, product_id, warehouse_id, movement_type, quantity, unit_cost, document_id, note, created_at)
             VALUES (?1,?2,?3,'out',?4,NULL,?5,'Vente automatique',?6)",
            params![movement_id, product_id, warehouse_id, quantity, document_id, created_at],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
