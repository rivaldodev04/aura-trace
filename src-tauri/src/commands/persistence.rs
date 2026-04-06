// src-tauri/src/commands/persistence.rs
// Guardado y carga del estado del canvas en disco

use tauri::{AppHandle, Manager};
use std::fs;
use std::path::PathBuf;

fn get_save_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir()
        .map_err(|e| format!("Error obteniendo directorio: {}", e))?;

    // Crear directorio si no existe
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;

    Ok(app_dir.join("canvas_state.json"))
}

/// Guarda el JSON del canvas enviado desde el frontend.
#[tauri::command]
pub async fn save_canvas(
    app: AppHandle,
    canvas_json: String,
) -> Result<(), String> {
    let path = get_save_path(&app)?;

    fs::write(&path, &canvas_json)
        .map_err(|e| format!("Error guardando canvas: {}", e))?;

    Ok(())
}

/// Carga el JSON del canvas y lo retorna al frontend.
#[tauri::command]
pub async fn load_canvas(app: AppHandle) -> Result<Option<String>, String> {
    let path = get_save_path(&app)?;

    if !path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Error leyendo canvas: {}", e))?;

    Ok(Some(content))
}

/// Elimina el archivo de guardado.
#[tauri::command]
pub async fn clear_canvas(app: AppHandle) -> Result<(), String> {
    let path = get_save_path(&app)?;

    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Error eliminando canvas: {}", e))?;
    }

    Ok(())
}
