use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};

use crate::db::DbState;

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PaymentDto {
    pub id: String,
    pub document_id: Option<String>,
    pub direction: String,
    pub amount: f64,
    pub method: String,
    pub category: String,
    pub counterparty: String,
    pub paid_at: String,
    pub reference: String,
    pub note: String,
    pub created_at: String,
}

fn row_to_payment(row: &Row) -> rusqlite::Result<PaymentDto> {
    Ok(PaymentDto {
        id: row.get("id")?,
        document_id: row.get("document_id")?,
        direction: row.get("direction")?,
        amount: row.get("amount")?,
        method: row.get("method")?,
        category: row.get::<_, Option<String>>("category")?.unwrap_or_default(),
        counterparty: row.get::<_, Option<String>>("counterparty")?.unwrap_or_default(),
        paid_at: row.get("paid_at")?,
        reference: row.get::<_, Option<String>>("reference")?.unwrap_or_default(),
        note: row.get::<_, Option<String>>("note")?.unwrap_or_default(),
        created_at: row.get("created_at")?,
    })
}

#[tauri::command]
pub fn save_payment(state: tauri::State<DbState>, payment: PaymentDto) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO payments (id, document_id, direction, amount, method, category, counterparty, paid_at, reference, note, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
         ON CONFLICT(id) DO UPDATE SET
            document_id=excluded.document_id, direction=excluded.direction, amount=excluded.amount,
            method=excluded.method, category=excluded.category, counterparty=excluded.counterparty,
            paid_at=excluded.paid_at, reference=excluded.reference, note=excluded.note",
        params![
            payment.id,
            payment.document_id,
            payment.direction,
            payment.amount,
            payment.method,
            payment.category,
            payment.counterparty,
            payment.paid_at,
            payment.reference,
            payment.note,
            payment.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_payments(state: tauri::State<DbState>, document_id: Option<String>) -> Result<Vec<PaymentDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    match document_id {
        Some(doc_id) => {
            let mut stmt = conn
                .prepare("SELECT * FROM payments WHERE document_id = ?1 ORDER BY paid_at DESC")
                .map_err(|e| e.to_string())?;
            let rows = stmt.query_map(params![doc_id], row_to_payment).map_err(|e| e.to_string())?;
            rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
        }
        None => {
            let mut stmt = conn.prepare("SELECT * FROM payments ORDER BY paid_at DESC").map_err(|e| e.to_string())?;
            let rows = stmt.query_map([], row_to_payment).map_err(|e| e.to_string())?;
            rows.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
pub fn remove_payment(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM payments WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    Ok(())
}
