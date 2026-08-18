use rusqlite::{params, Connection, Row};
use serde::Deserialize;

use crate::commands::document_dto::{DiscountDto, DocumentDto, DocumentLineDto, DocumentMetaDto, WithholdingDto};
use crate::db::DbState;

/// Upserts a document header and fully replaces its lines. Shared by
/// `save_document` and the one-time legacy-invoice migration — both are the
/// exact same "write this whole document" operation.
pub fn upsert_document(conn: &Connection, doc: &DocumentDto) -> rusqlite::Result<()> {
    let seller_json = serde_json::to_string(&doc.seller).unwrap_or_default();
    let client_json = serde_json::to_string(&doc.client).unwrap_or_default();
    let payment_json = serde_json::to_string(&doc.payment).unwrap_or_default();
    let visible_sections_json = serde_json::to_string(&doc.visible_sections).unwrap_or_default();

    conn.execute(
        "INSERT INTO documents (
            id, doc_type, custom_type_label, document_number, name, status, issue_date, due_date, currency, locale,
            default_tax_rate_percent, seller_json, client_json, discount_type, discount_value,
            withholding_rate_percent, notes, terms_and_conditions, payment_json, payment_link,
            signature_label, signature_image_data_url, footer_note_left, footer_note_right,
            visible_sections_json, manual_subtotal, theme_color, template, created_at, updated_at
        ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30)
        ON CONFLICT(id) DO UPDATE SET
            doc_type=excluded.doc_type, custom_type_label=excluded.custom_type_label, document_number=excluded.document_number, name=excluded.name,
            status=excluded.status, issue_date=excluded.issue_date, due_date=excluded.due_date,
            currency=excluded.currency, locale=excluded.locale, default_tax_rate_percent=excluded.default_tax_rate_percent,
            seller_json=excluded.seller_json, client_json=excluded.client_json, discount_type=excluded.discount_type,
            discount_value=excluded.discount_value, withholding_rate_percent=excluded.withholding_rate_percent,
            notes=excluded.notes, terms_and_conditions=excluded.terms_and_conditions, payment_json=excluded.payment_json,
            payment_link=excluded.payment_link, signature_label=excluded.signature_label,
            signature_image_data_url=excluded.signature_image_data_url, footer_note_left=excluded.footer_note_left,
            footer_note_right=excluded.footer_note_right, visible_sections_json=excluded.visible_sections_json,
            manual_subtotal=excluded.manual_subtotal, theme_color=excluded.theme_color, template=excluded.template,
            updated_at=excluded.updated_at",
        params![
            doc.id,
            doc.doc_type,
            doc.custom_type_label,
            doc.meta.invoice_number,
            doc.name,
            doc.status,
            doc.meta.issue_date,
            doc.meta.due_date,
            doc.meta.currency,
            doc.meta.locale,
            doc.meta.default_tax_rate_percent,
            seller_json,
            client_json,
            doc.discount.kind,
            doc.discount.value,
            doc.withholding.rate_percent,
            doc.notes,
            doc.terms_and_conditions,
            payment_json,
            doc.payment_link,
            doc.signature_label,
            doc.signature_image_data_url,
            doc.footer_note_left,
            doc.footer_note_right,
            visible_sections_json,
            doc.manual_subtotal,
            doc.theme_color,
            doc.template,
            doc.created_at,
            doc.updated_at,
        ],
    )?;

    conn.execute("DELETE FROM document_lines WHERE document_id = ?1", params![doc.id])?;
    for (position, item) in doc.items.iter().enumerate() {
        conn.execute(
            "INSERT INTO document_lines (id, document_id, position, description, quantity, unit_price, tax_rate_percent)
             VALUES (?1,?2,?3,?4,?5,?6,?7)",
            params![
                item.id,
                doc.id,
                position as i64,
                item.description,
                item.quantity,
                item.unit_price,
                item.tax_rate_percent,
            ],
        )?;
    }
    Ok(())
}

fn row_to_document_without_lines(row: &Row) -> rusqlite::Result<DocumentDto> {
    let seller_json: String = row.get("seller_json")?;
    let client_json: String = row.get("client_json")?;
    let payment_json: String = row.get("payment_json")?;
    let visible_sections_json: String = row.get("visible_sections_json")?;

    Ok(DocumentDto {
        id: row.get("id")?,
        doc_type: row.get("doc_type")?,
        custom_type_label: row.get::<_, Option<String>>("custom_type_label")?.unwrap_or_default(),
        name: row.get("name")?,
        status: row.get("status")?,
        meta: DocumentMetaDto {
            invoice_number: row.get("document_number")?,
            issue_date: row.get("issue_date")?,
            due_date: row.get("due_date")?,
            currency: row.get("currency")?,
            locale: row.get("locale")?,
            default_tax_rate_percent: row.get("default_tax_rate_percent")?,
        },
        seller: serde_json::from_str(&seller_json).unwrap_or(serde_json::Value::Null),
        client: serde_json::from_str(&client_json).unwrap_or(serde_json::Value::Null),
        items: Vec::new(),
        discount: DiscountDto { kind: row.get("discount_type")?, value: row.get("discount_value")? },
        withholding: WithholdingDto { rate_percent: row.get("withholding_rate_percent")? },
        notes: row.get("notes")?,
        terms_and_conditions: row.get("terms_and_conditions")?,
        payment: serde_json::from_str(&payment_json).unwrap_or(serde_json::Value::Null),
        payment_link: row.get("payment_link")?,
        signature_label: row.get("signature_label")?,
        signature_image_data_url: row.get("signature_image_data_url")?,
        footer_note_left: row.get("footer_note_left")?,
        footer_note_right: row.get("footer_note_right")?,
        visible_sections: serde_json::from_str(&visible_sections_json).unwrap_or(serde_json::Value::Null),
        manual_subtotal: row.get("manual_subtotal")?,
        theme_color: row.get("theme_color")?,
        template: row.get("template")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

fn fetch_lines(conn: &Connection, document_id: &str) -> rusqlite::Result<Vec<DocumentLineDto>> {
    let mut stmt = conn.prepare(
        "SELECT id, description, quantity, unit_price, tax_rate_percent
         FROM document_lines WHERE document_id = ?1 ORDER BY position",
    )?;
    let rows = stmt.query_map(params![document_id], |r| {
        Ok(DocumentLineDto {
            id: r.get(0)?,
            description: r.get(1)?,
            quantity: r.get(2)?,
            unit_price: r.get(3)?,
            tax_rate_percent: r.get(4)?,
        })
    })?;
    rows.collect()
}

#[tauri::command]
pub fn save_document(state: tauri::State<DbState>, document: DocumentDto) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    upsert_document(&conn, &document).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_documents(state: tauri::State<DbState>) -> Result<Vec<DocumentDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare("SELECT * FROM documents ORDER BY updated_at DESC").map_err(|e| e.to_string())?;
    let mut docs: Vec<DocumentDto> = stmt
        .query_map([], row_to_document_without_lines)
        .map_err(|e| e.to_string())?
        .collect::<rusqlite::Result<_>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    for doc in &mut docs {
        doc.items = fetch_lines(&conn, &doc.id).map_err(|e| e.to_string())?;
    }
    Ok(docs)
}

#[tauri::command]
pub fn remove_document(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM documents WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateDocumentLinkRequest {
    pub id: String,
    pub source_document_id: String,
    pub target_document_id: String,
    pub relation: String,
    pub created_at: String,
}

#[tauri::command]
pub fn create_document_link(state: tauri::State<DbState>, request: CreateDocumentLinkRequest) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO document_links (id, source_document_id, target_document_id, relation, created_at) VALUES (?1,?2,?3,?4,?5)",
        params![request.id, request.source_document_id, request.target_document_id, request.relation, request.created_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
