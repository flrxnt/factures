use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};

use crate::db::DbState;

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProductDto {
    pub id: String,
    pub kind: String,
    pub sku: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub unit: String,
    pub purchase_price: Option<f64>,
    pub sale_price: f64,
    pub tax_rate_percent: f64,
    pub supplier_id: Option<String>,
    pub low_stock_threshold: Option<f64>,
    pub archived_at: String,
    pub created_at: String,
    pub updated_at: String,
}

fn row_to_product(row: &Row) -> rusqlite::Result<ProductDto> {
    Ok(ProductDto {
        id: row.get("id")?,
        kind: row.get("kind")?,
        sku: row.get("sku")?,
        name: row.get("name")?,
        description: row.get("description")?,
        category: row.get("category")?,
        unit: row.get("unit")?,
        purchase_price: row.get("purchase_price")?,
        sale_price: row.get("sale_price")?,
        tax_rate_percent: row.get("tax_rate_percent")?,
        supplier_id: row.get("supplier_id")?,
        low_stock_threshold: row.get("low_stock_threshold")?,
        archived_at: row.get("archived_at")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

#[tauri::command]
pub fn save_product(state: tauri::State<DbState>, product: ProductDto) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (
            id, kind, sku, name, description, category, unit, purchase_price, sale_price,
            tax_rate_percent, supplier_id, low_stock_threshold, archived_at, created_at, updated_at
        ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)
        ON CONFLICT(id) DO UPDATE SET
            kind=excluded.kind, sku=excluded.sku, name=excluded.name, description=excluded.description,
            category=excluded.category, unit=excluded.unit, purchase_price=excluded.purchase_price,
            sale_price=excluded.sale_price, tax_rate_percent=excluded.tax_rate_percent,
            supplier_id=excluded.supplier_id, low_stock_threshold=excluded.low_stock_threshold,
            archived_at=excluded.archived_at, updated_at=excluded.updated_at",
        params![
            product.id,
            product.kind,
            product.sku,
            product.name,
            product.description,
            product.category,
            product.unit,
            product.purchase_price,
            product.sale_price,
            product.tax_rate_percent,
            product.supplier_id,
            product.low_stock_threshold,
            product.archived_at,
            product.created_at,
            product.updated_at,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_products(state: tauri::State<DbState>) -> Result<Vec<ProductDto>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM products ORDER BY name COLLATE NOCASE ASC").map_err(|e| e.to_string())?;
    let products = stmt
        .query_map([], row_to_product)
        .map_err(|e| e.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|e| e.to_string())?;
    Ok(products)
}

#[tauri::command]
pub fn remove_product(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM products WHERE id = ?1", params![id]).map_err(|e| {
        if let rusqlite::Error::SqliteFailure(_, Some(message)) = &e {
            if message.contains("FOREIGN KEY") {
                return "Ce produit est utilisé dans au moins un document — archivez-le plutôt que de le supprimer.".to_string();
            }
        }
        e.to_string()
    })?;
    Ok(())
}
