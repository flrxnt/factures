use serde::{Deserialize, Serialize};

use crate::db::{self, DbState};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyLineItem {
    pub id: String,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub tax_rate_percent: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyInvoiceMeta {
    pub invoice_number: String,
    pub issue_date: String,
    pub due_date: String,
    pub currency: String,
    pub locale: String,
    pub default_tax_rate_percent: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyDiscount {
    #[serde(rename = "type")]
    pub kind: String,
    pub value: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyWithholding {
    pub rate_percent: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyInvoice {
    pub id: String,
    pub name: String,
    pub status: String,
    pub meta: LegacyInvoiceMeta,
    pub seller: serde_json::Value,
    pub client: serde_json::Value,
    pub items: Vec<LegacyLineItem>,
    pub discount: LegacyDiscount,
    pub withholding: LegacyWithholding,
    pub notes: String,
    pub terms_and_conditions: String,
    pub payment: serde_json::Value,
    pub payment_link: String,
    pub signature_label: String,
    pub signature_image_data_url: String,
    pub footer_note_left: String,
    pub footer_note_right: String,
    pub visible_sections: serde_json::Value,
    pub manual_subtotal: Option<f64>,
    pub theme_color: String,
    pub template: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportSummary {
    pub imported: usize,
    pub skipped: usize,
}

const IMPORT_FLAG_KEY: &str = "legacy_invoices_imported";

/// One-time migration from the web/legacy `localStorage` invoice array
/// (read JS-side, since Rust has no access to the webview's localStorage)
/// into the new `documents`/`document_lines` tables, tagged `doc_type='invoice'`.
/// Idempotent: a `schema_meta` flag prevents re-running on every launch.
#[tauri::command]
pub fn import_legacy_invoices(state: tauri::State<DbState>, invoices: Vec<LegacyInvoice>) -> Result<ImportSummary, String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;

    if db::get_meta(&conn, IMPORT_FLAG_KEY).map_err(|e| e.to_string())?.is_some() {
        return Ok(ImportSummary { imported: 0, skipped: invoices.len() });
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let mut imported = 0usize;

    for invoice in &invoices {
        let seller_json = serde_json::to_string(&invoice.seller).map_err(|e| e.to_string())?;
        let client_json = serde_json::to_string(&invoice.client).map_err(|e| e.to_string())?;
        let payment_json = serde_json::to_string(&invoice.payment).map_err(|e| e.to_string())?;
        let visible_sections_json = serde_json::to_string(&invoice.visible_sections).map_err(|e| e.to_string())?;

        tx.execute(
            "INSERT OR IGNORE INTO documents (
                id, doc_type, document_number, name, status, issue_date, due_date, currency, locale,
                default_tax_rate_percent, seller_json, client_json, discount_type, discount_value,
                withholding_rate_percent, notes, terms_and_conditions, payment_json, payment_link,
                signature_label, signature_image_data_url, footer_note_left, footer_note_right,
                visible_sections_json, manual_subtotal, theme_color, template, created_at, updated_at
            ) VALUES (?1,'invoice',?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27)",
            rusqlite::params![
                invoice.id,
                invoice.meta.invoice_number,
                invoice.name,
                invoice.status,
                invoice.meta.issue_date,
                invoice.meta.due_date,
                invoice.meta.currency,
                invoice.meta.locale,
                invoice.meta.default_tax_rate_percent,
                seller_json,
                client_json,
                invoice.discount.kind,
                invoice.discount.value,
                invoice.withholding.rate_percent,
                invoice.notes,
                invoice.terms_and_conditions,
                payment_json,
                invoice.payment_link,
                invoice.signature_label,
                invoice.signature_image_data_url,
                invoice.footer_note_left,
                invoice.footer_note_right,
                visible_sections_json,
                invoice.manual_subtotal,
                invoice.theme_color,
                invoice.template,
                invoice.created_at,
                invoice.updated_at,
            ],
        )
        .map_err(|e| e.to_string())?;

        for (position, item) in invoice.items.iter().enumerate() {
            tx.execute(
                "INSERT OR IGNORE INTO document_lines (id, document_id, position, description, quantity, unit_price, tax_rate_percent)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    item.id,
                    invoice.id,
                    position as i64,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.tax_rate_percent,
                ],
            )
            .map_err(|e| e.to_string())?;
        }

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
