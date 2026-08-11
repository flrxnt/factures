mod commands;

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
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
