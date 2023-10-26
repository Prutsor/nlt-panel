#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{net::Ipv4Addr, sync::Arc};

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio::io;
use window_vibrancy::apply_mica;

use mdns_sd::{ServiceDaemon, ServiceEvent};
use tokio::sync::{Mutex, Notify};
use tokio::{io::AsyncWriteExt, net::TcpStream};

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
    tcp_client: Option<TcpStream>,
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
    let mut state = state.lock().await;

    if state.tcp_client.is_none() {
        println!("starting stream {}", panel.ip.unwrap().to_string());

        let client = TcpStream::connect((panel.ip.unwrap().to_string(), 1935))
            .await
            .unwrap();

        state.tcp_client = Some(client);

        tokio::spawn(async move {
            let state = window.state::<Arc<Mutex<AppState>>>().inner().lock().await;
            let client = state.tcp_client.as_ref().unwrap();

            let mut buffer = vec![0; 1024];
            loop {
                client.readable().await.unwrap();

                match client.try_read(&mut buffer) {
                    Ok(n) => {
                        buffer.truncate(n);

                        println!("packet size: {}", n);

                        // Send the received buffer to the window
                        window.emit("stream_data", buffer.clone()).unwrap();
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
    }

    Ok(())
}

#[tauri::command]
async fn panel_stop_stream(state: tauri::State<'_, Arc<Mutex<AppState>>>) -> Result<(), String> {
    let mut state = state.lock().await;

    if let Some(mut client) = state.tcp_client.take() {
        // Close the TCP client connection
        if let Err(err) = client.shutdown().await {
            eprintln!("Failed to close TCP client connection: {}", err);
        }
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

            if cfg!(target_os = "windows") {
                apply_mica(&window).unwrap();
            }

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
                                ip: Some(info.get_addresses().iter().next().unwrap().clone()),
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
