// src-tauri/src/commands/drawing.rs
// Comandos de estado de dibujo

use tauri::State;
use crate::state::app_state::AppState;

/// Retorna el estado actual del modo dibujo.
#[tauri::command]
pub async fn get_drawing_state(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let drawing_state = state.drawing.lock()
        .map_err(|e| format!("Error de lock: {}", e))?;
    Ok(drawing_state.is_drawing_mode)
}
