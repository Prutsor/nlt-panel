#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use window_vibrancy::apply_mica;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
      
            apply_mica(&window).unwrap();

            window.set_decorations(true).unwrap();
      
            Ok(())
          })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
