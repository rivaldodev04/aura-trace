// src-tauri/src/lib.rs
// Aura Trace — Main Library Entry Point
// ARQUITECTURA: Este archivo configura la ventana principal y registra
// todos los plugins. NO debe contener lógica de negocio.

use tauri::Manager;

mod commands;
mod shortcuts;
mod state;

use state::app_state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ═══════════════════════════════════════════
        // PLUGINS CORE
        // ═══════════════════════════════════════════
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // ═══════════════════════════════════════════
        // ESTADO GLOBAL DE LA APLICACIÓN
        // ═══════════════════════════════════════════
        .manage(AppState::new())
        // ═══════════════════════════════════════════
        // SETUP INICIAL
        // ═══════════════════════════════════════════
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Configurar la ventana como overlay transparente
            setup_overlay_window(&window)?;

            // Registrar atajos de teclado globales
            shortcuts::global_keys::register_shortcuts(app)?;

            // En debug, abrir DevTools
            #[cfg(debug_assertions)]
            window.open_devtools();

            Ok(())
        })
        // ═══════════════════════════════════════════
        // COMANDOS IPC (Frontend → Backend)
        // ═══════════════════════════════════════════
        .invoke_handler(tauri::generate_handler![
            commands::window::toggle_drawing_mode,
            commands::window::set_click_through,
            commands::window::get_window_size,
            commands::drawing::get_drawing_state,
            commands::persistence::save_canvas,
            commands::persistence::load_canvas,
            commands::persistence::clear_canvas,
        ])
        .run(tauri::generate_context!())
        .expect("Error al iniciar Aura Trace");
}

/// Configura la ventana principal como un overlay transparente click-through.
/// IMPORTANTE: El orden de las llamadas importa en Windows.
fn setup_overlay_window(window: &tauri::WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
    // 1. Hacer la ventana transparente (ya configurado en tauri.conf.json
    //    pero confirmamos programáticamente)
    window.set_decorations(false)?;
    window.set_always_on_top(true)?;

    // 2. Activar click-through al inicio (el overlay NO captura clics)
    // En Windows: WS_EX_TRANSPARENT via set_ignore_cursor_events
    // En macOS: NSWindow ignoresMouseEvents
    // En Linux: gtk_widget_set_events
    window.set_ignore_cursor_events(true)?;

    // 3. Posicionar en la esquina superior izquierda de la pantalla principal
    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
        x: 0,
        y: 0,
    }))?;

    // 4. Maximizar para cubrir toda la pantalla (sin bordes)
    // Usamos el tamaño del monitor en lugar de maximize() para evitar
    // que el sistema operativo añada márgenes.
    if let Some(monitor) = window.current_monitor()? {
        let size = monitor.size();
        window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: size.width,
            height: size.height,
        }))?;
    }

    Ok(())
}
