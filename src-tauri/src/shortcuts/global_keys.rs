// src-tauri/src/shortcuts/global_keys.rs
// Registro de atajos de teclado globales que funcionan incluso cuando
// el foco está en el broker (Olymp Trade, etc.)

use tauri::AppHandle;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn register_shortcuts(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    // Atajo principal: Ctrl+D → Toggle Modo Dibujo
    let toggle_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyD);

    // Atajo de limpieza: Ctrl+Shift+C → Limpiar canvas completo
    let clear_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyC);

    // Atajo de deshacer: Ctrl+Z → Deshacer último objeto
    let undo_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyZ);

    // Atajo de visibilidad: Ctrl+H → Ocultar/Mostrar todo el overlay
    let hide_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyH);

    app.global_shortcut().on_shortcuts(
        [
            toggle_shortcut,
            clear_shortcut,
            undo_shortcut,
            hide_shortcut,
        ],
        move |_app, shortcut, event| {
            if event.state == ShortcutState::Pressed {
                handle_shortcut(&app_handle, shortcut);
            }
        },
    )?;

    Ok(())
}

fn handle_shortcut(app: &AppHandle, shortcut: &Shortcut) {
    use tauri::Emitter;

    match (shortcut.key, shortcut.mods) {
        (Code::KeyD, Modifiers::CONTROL) => {
            let _ = app.emit("shortcut-toggle-drawing", ());
        }
        (Code::KeyC, m) if m.contains(Modifiers::CONTROL | Modifiers::SHIFT) => {
            let _ = app.emit("shortcut-clear-canvas", ());
        }
        (Code::KeyZ, Modifiers::CONTROL) => {
            let _ = app.emit("shortcut-undo", ());
        }
        (Code::KeyH, Modifiers::CONTROL) => {
            let _ = app.emit("shortcut-toggle-visibility", ());
        }
        _ => {}
    }
}
