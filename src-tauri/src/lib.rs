mod commands;
mod db;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      commands::email::save_smtp_password,
      commands::email::has_smtp_password,
      commands::email::delete_smtp_password,
      commands::email::test_smtp_connection,
      commands::email::send_invoice_email,
      commands::payments::save_payment_secret,
      commands::payments::has_payment_secret,
      commands::payments::delete_payment_secret,
      commands::payments::create_stripe_payment_link,
      commands::payments::create_paydunya_payment_link,
      commands::migration::import_legacy_invoices,
      commands::migration::has_imported_legacy_invoices,
      commands::documents::save_document,
      commands::documents::list_documents,
      commands::documents::remove_document,
      commands::documents::create_document_link,
      commands::products::save_product,
      commands::products::list_products,
      commands::products::remove_product,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let app_data_dir = app.path().app_data_dir().expect("no app data dir resolved");
      let conn = db::open(&app_data_dir).expect("failed to open the local database");
      app.manage(db::DbState(Mutex::new(conn)));

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
