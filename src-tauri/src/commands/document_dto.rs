use serde::{Deserialize, Serialize};

fn default_doc_type() -> String {
    "invoice".to_string()
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DocumentLineDto {
    pub id: String,
    pub description: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub tax_rate_percent: f64,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetaDto {
    pub invoice_number: String,
    pub issue_date: String,
    pub due_date: String,
    pub currency: String,
    pub locale: String,
    pub default_tax_rate_percent: f64,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiscountDto {
    #[serde(rename = "type")]
    pub kind: String,
    pub value: f64,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WithholdingDto {
    pub rate_percent: f64,
}

/// Shared shape for a commercial document (invoice or quote today) — used
/// both for the one-time legacy-invoice migration and the regular
/// save/list/remove commands, since they operate on the exact same data.
#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DocumentDto {
    pub id: String,
    #[serde(default = "default_doc_type")]
    pub doc_type: String,
    #[serde(default)]
    pub custom_type_label: String,
    pub name: String,
    pub status: String,
    pub meta: DocumentMetaDto,
    pub seller: serde_json::Value,
    pub client: serde_json::Value,
    pub items: Vec<DocumentLineDto>,
    pub discount: DiscountDto,
    pub withholding: WithholdingDto,
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
