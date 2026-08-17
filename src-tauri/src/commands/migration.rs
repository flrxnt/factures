use serde::Serialize;

use crate::commands::document_dto::DocumentDto;
use crate::commands::documents::upsert_document;
use crate::db::{self, DbState};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
    pub imported: usize,
    pub skipped: usize,
}

const IMPORT_FLAG_KEY: &str = "legacy_invoices_imported";

/// One-time migration from the web/legacy `localStorage` invoice array
/// (read JS-side, since Rust has no access to the webview's localStorage)
/// into the new `documents`/`document_lines` tables. Idempotent: a
/// `schema_meta` flag prevents re-running on every launch.
#[tauri::command]
pub fn import_legacy_invoices(state: tauri::State<DbState>, invoices: Vec<DocumentDto>) -> Result<ImportSummary, String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;

    if db::get_meta(&conn, IMPORT_FLAG_KEY).map_err(|e| e.to_string())?.is_some() {
        return Ok(ImportSummary { imported: 0, skipped: invoices.len() });
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let mut imported = 0usize;

    for invoice in &invoices {
        upsert_document(&tx, invoice).map_err(|e| e.to_string())?;
        imported += 1;
    }

    db::set_meta(&tx, IMPORT_FLAG_KEY, "true").map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())?;

    Ok(ImportSummary { imported, skipped: 0 })
}

#[tauri::command]
pub fn has_imported_legacy_invoices(state: tauri::State<DbState>) -> Result<bool, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    Ok(db::get_meta(&conn, IMPORT_FLAG_KEY).map_err(|e| e.to_string())?.is_some())
}
