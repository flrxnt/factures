use base64::{engine::general_purpose::STANDARD, Engine as _};
use lettre::message::{header::ContentType, Attachment, MultiPart, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use serde::Deserialize;

const KEYRING_SERVICE: &str = "com.flrxnt.facture";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SmtpCredentialRef {
    pub host: String,
    pub port: u16,
    pub username: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SmtpConnectionConfig {
    pub host: String,
    pub port: u16,
    pub security: String,
    pub username: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailAttachment {
    pub filename: String,
    pub content_base64: String,
    pub mime_type: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendEmailRequest {
    pub smtp: SmtpConnectionConfig,
    pub from_name: String,
    pub from_email: String,
    pub to_email: String,
    pub subject: String,
    pub body: String,
    pub attachment: EmailAttachment,
}

fn keyring_entry(host: &str, port: u16, username: &str) -> Result<keyring::Entry, String> {
    let account = format!("smtp:{}:{}:{}", host, port, username);
    keyring::Entry::new(KEYRING_SERVICE, &account).map_err(|e| e.to_string())
}

fn read_password(host: &str, port: u16, username: &str) -> Result<String, String> {
    keyring_entry(host, port, username)?
        .get_password()
        .map_err(|e| e.to_string())
}

fn build_transport(config: &SmtpConnectionConfig, password: String) -> Result<AsyncSmtpTransport<Tokio1Executor>, String> {
    let creds = Credentials::new(config.username.clone(), password);
    let builder = match config.security.as_str() {
        "ssl" => AsyncSmtpTransport::<Tokio1Executor>::relay(&config.host).map_err(|e| e.to_string())?,
        "starttls" => AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.host).map_err(|e| e.to_string())?,
        _ => AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(&config.host),
    };
    Ok(builder.port(config.port).credentials(creds).build())
}

#[tauri::command]
pub fn save_smtp_password(cred: SmtpCredentialRef, password: String) -> Result<(), String> {
    keyring_entry(&cred.host, cred.port, &cred.username)?
        .set_password(&password)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_smtp_password(cred: SmtpCredentialRef) -> Result<bool, String> {
    match keyring_entry(&cred.host, cred.port, &cred.username)?.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_smtp_password(cred: SmtpCredentialRef) -> Result<(), String> {
    match keyring_entry(&cred.host, cred.port, &cred.username)?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn test_smtp_connection(smtp: SmtpConnectionConfig) -> Result<(), String> {
    let password = read_password(&smtp.host, smtp.port, &smtp.username)?;
    let transport = build_transport(&smtp, password)?;
    let connected = transport.test_connection().await.map_err(|e| e.to_string())?;
    if connected {
        Ok(())
    } else {
        Err("La connexion au serveur SMTP a échoué.".to_string())
    }
}

#[tauri::command]
pub async fn send_invoice_email(request: SendEmailRequest) -> Result<(), String> {
    let password = read_password(&request.smtp.host, request.smtp.port, &request.smtp.username)?;
    let transport = build_transport(&request.smtp, password)?;

    let pdf_bytes = STANDARD
        .decode(&request.attachment.content_base64)
        .map_err(|e| e.to_string())?;
    let mime_type: ContentType = request
        .attachment
        .mime_type
        .parse()
        .map_err(|_| "Type MIME de la pièce jointe invalide.".to_string())?;

    let from = format!("{} <{}>", request.from_name, request.from_email)
        .parse()
        .map_err(|e: lettre::address::AddressError| e.to_string())?;
    let to = request
        .to_email
        .parse()
        .map_err(|e: lettre::address::AddressError| e.to_string())?;

    let email = Message::builder()
        .from(from)
        .to(to)
        .subject(request.subject)
        .multipart(
            MultiPart::mixed()
                .singlepart(SinglePart::builder().header(ContentType::TEXT_PLAIN).body(request.body))
                .singlepart(Attachment::new(request.attachment.filename).body(pdf_bytes, mime_type)),
        )
        .map_err(|e| e.to_string())?;

    transport.send(email).await.map_err(|e| e.to_string())?;
    Ok(())
}
