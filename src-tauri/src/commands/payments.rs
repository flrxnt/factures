use serde::{Deserialize, Serialize};

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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PayPalConfig {
    pub client_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentLinkResult {
    pub url: String,
    pub reference: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentStatusResult {
    pub paid: bool,
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
pub async fn create_stripe_payment_link(request: CreatePaymentLinkRequest) -> Result<PaymentLinkResult, String> {
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

    let url = body["url"]
        .as_str()
        .ok_or_else(|| "Réponse Stripe invalide : URL manquante.".to_string())?
        .to_string();
    let reference = body["id"]
        .as_str()
        .ok_or_else(|| "Réponse Stripe invalide : identifiant de session manquant.".to_string())?
        .to_string();

    Ok(PaymentLinkResult { url, reference })
}

/// Looks up a previously created Checkout Session and reports whether it was
/// paid — `reference` is the session id captured when the link was created.
#[tauri::command]
pub async fn check_stripe_payment_status(reference: String) -> Result<PaymentStatusResult, String> {
    let secret_key = read_secret("stripe", "secret_key")?;

    let client = reqwest::Client::new();
    let response = client
        .get(format!("https://api.stripe.com/v1/checkout/sessions/{}", reference))
        .bearer_auth(&secret_key)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let message = body["error"]["message"].as_str().unwrap_or("Erreur Stripe inconnue.");
        return Err(message.to_string());
    }

    Ok(PaymentStatusResult { paid: body["payment_status"].as_str() == Some("paid") })
}

#[tauri::command]
pub async fn create_paydunya_payment_link(config: PayDunyaConfig, request: CreatePaymentLinkRequest) -> Result<PaymentLinkResult, String> {
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
        .ok_or_else(|| "Réponse PayDunya invalide : jeton manquant.".to_string())?
        .to_string();
    let url = format!("https://paydunya.com/checkout/invoice/{}", token_value);

    Ok(PaymentLinkResult { url, reference: token_value })
}

/// Confirms a previously created checkout invoice and reports whether it was
/// completed — `reference` is the PayDunya token captured when the link was
/// created (the same value embedded in the checkout URL).
#[tauri::command]
pub async fn check_paydunya_payment_status(config: PayDunyaConfig, reference: String) -> Result<PaymentStatusResult, String> {
    let private_key = read_secret("paydunya", "private_key")?;
    let token = read_secret("paydunya", "token")?;

    let client = reqwest::Client::new();
    let response = client
        .get(format!("https://app.paydunya.com/api/v1/checkout-invoice/confirm/{}", reference))
        .header("PAYDUNYA-MASTER-KEY", &config.master_key)
        .header("PAYDUNYA-PRIVATE-KEY", &private_key)
        .header("PAYDUNYA-PUBLIC-KEY", &config.public_key)
        .header("PAYDUNYA-TOKEN", &token)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let response_code = body["response_code"].as_str().unwrap_or("");
    if response_code != "00" {
        let message = body["response_text"].as_str().unwrap_or("Erreur PayDunya inconnue.");
        return Err(message.to_string());
    }

    Ok(PaymentStatusResult { paid: body["status"].as_str() == Some("completed") })
}

// PayPal reports amounts with the currency's natural decimal places — most
// take 2, a handful (matching ISO 4217's zero-exponent list) take none.
const PAYPAL_ZERO_DECIMAL_CURRENCIES: &[&str] = &["JPY", "HUF", "TWD", "KRW", "PYG", "VUV", "XAF", "XOF", "XPF"];

fn paypal_amount_value(amount: f64, currency_upper: &str) -> String {
    if PAYPAL_ZERO_DECIMAL_CURRENCIES.contains(&currency_upper) {
        format!("{}", amount.round() as i64)
    } else {
        format!("{:.2}", amount)
    }
}

fn paypal_base_url(mode: &str) -> &'static str {
    if mode == "live" {
        "https://api-m.paypal.com"
    } else {
        "https://api-m.sandbox.paypal.com"
    }
}

async fn paypal_access_token(client: &reqwest::Client, base_url: &str, client_id: &str, client_secret: &str) -> Result<String, String> {
    let response = client
        .post(format!("{}/v1/oauth2/token", base_url))
        .basic_auth(client_id, Some(client_secret))
        .form(&[("grant_type", "client_credentials")])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let message = body["error_description"].as_str().unwrap_or("Authentification PayPal invalide.");
        return Err(message.to_string());
    }

    body["access_token"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Réponse PayPal invalide : jeton d'accès manquant.".to_string())
}

#[tauri::command]
pub async fn create_paypal_payment_link(config: PayPalConfig, mode: String, request: CreatePaymentLinkRequest) -> Result<PaymentLinkResult, String> {
    let client_secret = read_secret("paypal", "client_secret")?;
    let base_url = paypal_base_url(&mode);
    let client = reqwest::Client::new();
    let access_token = paypal_access_token(&client, base_url, &config.client_id, &client_secret).await?;

    let currency_upper = request.currency.to_uppercase();
    let value = paypal_amount_value(request.amount, &currency_upper);

    let payload = serde_json::json!({
        "intent": "CAPTURE",
        "purchase_units": [{
            "description": request.description,
            "amount": {
                "currency_code": currency_upper,
                "value": value,
            },
        }],
        "application_context": {
            "brand_name": request.store_name,
            "return_url": REDIRECT_URL,
            "cancel_url": REDIRECT_URL,
        },
    });

    let response = client
        .post(format!("{}/v2/checkout/orders", base_url))
        .bearer_auth(&access_token)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let message = body["message"].as_str().unwrap_or("Erreur PayPal inconnue.");
        return Err(message.to_string());
    }

    let reference = body["id"]
        .as_str()
        .ok_or_else(|| "Réponse PayPal invalide : identifiant de commande manquant.".to_string())?
        .to_string();
    let url = body["links"]
        .as_array()
        .and_then(|links| links.iter().find(|link| link["rel"].as_str() == Some("approve")))
        .and_then(|link| link["href"].as_str())
        .ok_or_else(|| "Réponse PayPal invalide : lien d'approbation manquant.".to_string())?
        .to_string();

    Ok(PaymentLinkResult { url, reference })
}

/// Checks a previously created order and reports whether it was paid.
/// `reference` is the order id captured when the link was created. PayPal
/// only marks an order COMPLETED once it's been captured — this app has no
/// webhook/redirect handler to do that automatically, so if the payer has
/// already approved it (status APPROVED), this captures it on the spot as
/// part of "verifying" the payment.
#[tauri::command]
pub async fn check_paypal_payment_status(config: PayPalConfig, mode: String, reference: String) -> Result<PaymentStatusResult, String> {
    let client_secret = read_secret("paypal", "client_secret")?;
    let base_url = paypal_base_url(&mode);
    let client = reqwest::Client::new();
    let access_token = paypal_access_token(&client, base_url, &config.client_id, &client_secret).await?;

    let response = client
        .get(format!("{}/v2/checkout/orders/{}", base_url, reference))
        .bearer_auth(&access_token)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        let message = body["message"].as_str().unwrap_or("Erreur PayPal inconnue.");
        return Err(message.to_string());
    }

    let order_status = body["status"].as_str().unwrap_or("");
    if order_status == "COMPLETED" {
        return Ok(PaymentStatusResult { paid: true });
    }
    if order_status != "APPROVED" {
        return Ok(PaymentStatusResult { paid: false });
    }

    let capture_response = client
        .post(format!("{}/v2/checkout/orders/{}/capture", base_url, reference))
        .bearer_auth(&access_token)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let capture_status = capture_response.status();
    let capture_body: serde_json::Value = capture_response.json().await.map_err(|e| e.to_string())?;

    if !capture_status.is_success() {
        let message = capture_body["message"].as_str().unwrap_or("Erreur lors de la capture du paiement PayPal.");
        return Err(message.to_string());
    }

    Ok(PaymentStatusResult { paid: capture_body["status"].as_str() == Some("COMPLETED") })
}
