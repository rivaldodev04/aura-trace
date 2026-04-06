// src-tauri/src/state/app_state.rs
// Estado compartido y thread-safe de la aplicación Rust

use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrawingState {
    /// true = Modo Dibujo activo (captura clics)
    /// false = Click-through activo (broker recibe clics)
    pub is_drawing_mode: bool,

    /// Herramienta activa actualmente
    pub active_tool: String,

    /// Número de objetos en el canvas
    pub object_count: usize,
}

impl Default for DrawingState {
    fn default() -> Self {
        Self {
            is_drawing_mode: false,
            active_tool: "select".to_string(),
            object_count: 0,
        }
    }
}

pub struct AppState {
    pub drawing: Mutex<DrawingState>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            drawing: Mutex::new(DrawingState::default()),
        }
    }
}
