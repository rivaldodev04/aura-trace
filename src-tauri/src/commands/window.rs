// src-tauri/src/commands/window.rs
// Comandos para controlar el comportamiento de la ventana nativa

use crate::state::app_state::AppState;
use tauri::{AppHandle, Emitter, Manager, State};

/// COMANDO PRINCIPAL: Alterna entre Modo Dibujo y Modo Click-Through.
/// Llamado por: Frontend cuando el usuario presiona Ctrl+D.
/// Efecto: Cambia si la ventana captura o ignora eventos del mouse.
#[tauri::command]
pub async fn toggle_drawing_mode(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let mut drawing_state = state
        .drawing
        .lock()
        .map_err(|e| format!("Error de lock: {}", e))?;

    // Invertir el estado
    drawing_state.is_drawing_mode = !drawing_state.is_drawing_mode;
    let is_drawing = drawing_state.is_drawing_mode;

    // Aplicar el cambio a la ventana nativa
    if let Some(window) = app.get_webview_window("main") {
        // Si está en modo dibujo: ventana CAPTURA clics (ignore = false)
        // Si está en modo overlay: ventana IGNORA clics (ignore = true)
        window
            .set_ignore_cursor_events(!is_drawing)
            .map_err(|e| format!("Error al cambiar cursor events: {}", e))?;
    }

    // Emitir evento al frontend para actualizar la UI
    app.emit("drawing-mode-changed", is_drawing)
        .map_err(|e| format!("Error al emitir evento: {}", e))?;

    Ok(is_drawing)
}

/// Establece explícitamente el modo click-through sin toggle.
#[tauri::command]
pub async fn set_click_through(
    app: AppHandle,
    state: State<'_, AppState>,
    enabled: bool,
) -> Result<(), String> {
    let mut drawing_state = state
        .drawing
        .lock()
        .map_err(|e| format!("Error de lock: {}", e))?;

    drawing_state.is_drawing_mode = !enabled;

    if let Some(window) = app.get_webview_window("main") {
        window
            .set_ignore_cursor_events(enabled)
            .map_err(|e| format!("Error: {}", e))?;
    }

    Ok(())
}

/// Retorna el tamaño actual de la ventana (necesario para escalar el canvas).
#[tauri::command]
pub async fn get_window_size(app: AppHandle) -> Result<(u32, u32), String> {
    if let Some(window) = app.get_webview_window("main") {
        let size = window.inner_size().map_err(|e| format!("Error: {}", e))?;
        Ok((size.width, size.height))
    } else {
        Err("Ventana no encontrada".to_string())
    }
}
