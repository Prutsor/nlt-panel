#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{net::Ipv4Addr, sync::Arc};

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio::io;

#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;

use mdns_sd::{ServiceDaemon, ServiceEvent};
use tokio::task::JoinHandle;
use tokio::net::TcpStream;
use tokio::sync::Mutex;

#[derive(Clone, Serialize, Deserialize)]
pub struct Panel {
    pub name: String,
    pub version: Option<String>,

    pub ip: Option<Ipv4Addr>,
    pub port: u16,
}

#[derive(Default)]
struct AppState {
    panels: Vec<Panel>,

    stream: Option<JoinHandle<()>>,
}

#[tauri::command]
async fn get_panels(state: tauri::State<'_, Arc<Mutex<AppState>>>) -> Result<Vec<Panel>, String> {
    let state = state.lock().await;
    Ok(state.panels.clone())
}

#[tauri::command]
async fn add_panel(
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    panel: Panel,
) -> Result<(), String> {
    let mut state = state.lock().await;
    state.panels.push(panel.clone());
    Ok(())
}

#[tauri::command]
async fn panel_start_stream(
    window: tauri::Window,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    panel: Panel,
) -> Result<(), String> {
    let stream = tokio::spawn(async move {
        let client = TcpStream::connect((panel.ip.unwrap().to_string(), 1935))
            .await
            .unwrap();

        loop {
            client.readable().await.unwrap();

            let mut buffer = vec![0; 1024];

            match client.try_read(&mut buffer) {
                Ok(n) => {
                    buffer.truncate(n);

                    match buffer[0] {
                        0x01 => {
                            if buffer.len() > 255 {
                                window.emit("stream_data", buffer.clone()).unwrap();
                            }
                        }
                        0x02 => {
                            window.emit("stream_metadata", buffer.clone()).unwrap();
                        }
                        _ => {
                            eprintln!("Unknown packet type: {}", buffer[0]);
                        }
                    }
                }
                Err(ref e) if e.kind() == io::ErrorKind::WouldBlock => {
                    continue;
                }
                Err(e) => {
                    eprintln!("Failed to read from TCP stream: {}", e);
                    break;
                }
            }
        }
    });

    state.lock().await.stream = Some(stream);

    Ok(())
}

#[tauri::command]
async fn panel_stop_stream(state: tauri::State<'_, Arc<Mutex<AppState>>>) -> Result<(), String> {
    if let Some(client) = state.lock().await.stream.take() {
        client.abort();
    }

    Ok(())
}

fn main() {
    let empty_state: Arc<Mutex<AppState>> = Arc::new(Mutex::new(AppState::default()));

    tauri::Builder::default()
        .manage(empty_state)
        .invoke_handler(tauri::generate_handler![
            get_panels,
            add_panel,
            panel_start_stream,
            panel_stop_stream
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "windows")]
            let _ = apply_mica(&window, Some(true)); // TODO: check for dark mode

            window.set_decorations(true).unwrap();
            window.show().unwrap();

            tauri::async_runtime::spawn(async move {
                std::thread::sleep(std::time::Duration::from_secs(2)); //TODO: wait for page load

                let mdns = ServiceDaemon::new().expect("Failed to create daemon");
                let receiver = mdns
                    .browse("_nlt-panel._tcp.local.")
                    .expect("Failed to browse");

                while let Ok(event) = receiver.recv() {
                    match event {
                        ServiceEvent::ServiceResolved(info) => {
                            println!(
								"At: Resolved a new service: {} host: {} port: {} IP: {:?} TXT properties: {:?}",
								info.get_fullname(),
								info.get_hostname(),
								info.get_port(),
								info.get_addresses(),
								info.get_properties(),
							);

                            let panel = Panel {
                                name: info.get_hostname().split('.').next().unwrap().to_string(),
                                version: info
                                    .get_properties()
                                    .get("version")
                                    .and_then(|value| Some(value.val_str().to_string())),
                                ip: Some(
                                    info.get_addresses_v4()
                                        .iter()
                                        .next()
                                        .unwrap()
                                        .to_owned()
                                        .clone(),
                                ),
                                port: info.get_port(),
                            };

                            window.emit("panel_discovered", &panel).unwrap();
                        }
                        _other_event => {}
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
