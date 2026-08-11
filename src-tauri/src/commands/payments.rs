use serde::Deserialize;

use super::KEYRING_SERVICE;

// These are the "app.local" landing pages Stripe/PayDunya redirect the payer
// to after checkout — this app has no hosted backend to receive a real
// callback, so they just point at the marketing/web deployment.
const REDIRECT_URL: &str = "https://factures.weekshipper.com/";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentSecretRef {
    pub provider: String,
    pub field: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePaymentLinkRequest {
    pub amount: f64,
    pub currency: String,
    pub description: String,
    pub store_name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PayDunyaConfig {
    pub master_key: String,
    pub public_key: String,
}

fn secret_entry(provider: &str, field: &str) -> Result<keyring::Entry, String> {
    let account = format!("payment:{}:{}", provider, field);
    keyring::Entry::new(KEYRING_SERVICE, &account).map_err(|e| e.to_string())
}

fn read_secret(provider: &str, field: &str) -> Result<String, String> {
    secret_entry(provider, field)?.get_password().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_payment_secret(cred: PaymentSecretRef, value: String) -> Result<(), String> {
    secret_entry(&cred.provider, &cred.field)?
        .set_password(&value)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_payment_secret(cred: PaymentSecretRef) -> Result<bool, String> {
    match secret_entry(&cred.provider, &cred.field)?.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_payment_secret(cred: PaymentSecretRef) -> Result<(), String> {
    match secret_entry(&cred.provider, &cred.field)?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

// Stripe treats these currencies as having no minor unit — the amount is
// sent as-is instead of multiplied by 100. XOF (this app's default
// currency) is one of them.
const STRIPE_ZERO_DECIMAL_CURRENCIES: &[&str] = &[
    "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
];

fn stripe_unit_amount(amount: f64, currency_lower: &str) -> i64 {
    if STRIPE_ZERO_DECIMAL_CURRENCIES.contains(&currency_lower) {
        amount.round() as i64
    } else {
        (amount * 100.0).round() as i64
    }
}

#[tauri::command]
pub async fn create_stripe_payment_link(request: CreatePaymentLinkRequest) -> Result<String, String> {
    let secret_key = read_secret("stripe", "secret_key")?;
    let currency_lower = request.currency.to_lowercase();
    let unit_amount = stripe_unit_amount(request.amount, &currency_lower).to_string();

    let params = [
        ("mode", "payment"),
        ("success_url", REDIRECT_URL),
        ("cancel_url", REDIRECT_URL),
        ("line_items[0][quantity]", "1"),
        ("line_items[0][price_data][currency]", &currency_lower),
        ("line_items[0][price_data][product_data][name]", &request.description),
        ("line_items[0][price_data][unit_amount]", &unit_amount),
    ];

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.stripe.com/v1/checkout/sessions")
        .bearer_auth(&secret_key)
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let message = body["error"]["message"].as_str().unwrap_or("Erreur Stripe inconnue.");
        return Err(message.to_string());
    }

    body["url"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Réponse Stripe invalide : URL manquante.".to_string())
}

#[tauri::command]
pub async fn create_paydunya_payment_link(config: PayDunyaConfig, request: CreatePaymentLinkRequest) -> Result<String, String> {
    let private_key = read_secret("paydunya", "private_key")?;
    let token = read_secret("paydunya", "token")?;

    let payload = serde_json::json!({
        "invoice": {
            "total_amount": request.amount,
            "description": request.description,
        },
        "store": {
            "name": request.store_name,
        },
        "actions": {
            "cancel_url": REDIRECT_URL,
            "return_url": REDIRECT_URL,
            "callback_url": REDIRECT_URL,
        }
    });

    let client = reqwest::Client::new();
    let response = client
        .post("https://app.paydunya.com/api/v1/checkout-invoice/create")
        .header("PAYDUNYA-MASTER-KEY", &config.master_key)
        .header("PAYDUNYA-PRIVATE-KEY", &private_key)
        .header("PAYDUNYA-PUBLIC-KEY", &config.public_key)
        .header("PAYDUNYA-TOKEN", &token)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let response_code = body["response_code"].as_str().unwrap_or("");
    if response_code != "00" {
        let message = body["response_text"].as_str().unwrap_or("Erreur PayDunya inconnue.");
        return Err(message.to_string());
    }

    let token_value = body["token"]
        .as_str()
        .ok_or_else(|| "Réponse PayDunya invalide : jeton manquant.".to_string())?;
    Ok(format!("https://paydunya.com/checkout/invoice/{}", token_value))
}
