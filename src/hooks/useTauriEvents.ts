import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

// Aura Trace - Hook para escuchar eventos de atajos globales desde Rust
// Este hook conecta los atajos de teclado globales (Ctrl+D, Ctrl+Shift+C, etc.)
// con las acciones del frontend

export function useTauriEvents() {
  useEffect(() => {
    // Atajo Ctrl+D: Toggle Modo Dibujo
    const unlistenToggle = listen("shortcut-toggle-drawing", async () => {
      console.log("[Tauri] Toggle drawing mode");
      try {
        const isDrawing = await invoke<boolean>("toggle_drawing_mode");
        console.log("[Tauri] Drawing mode:", isDrawing ? "ON" : "OFF");
      } catch (e) {
        console.error("[Tauri] Error toggling drawing mode:", e);
      }
    });

    // Atajo Ctrl+Shift+C: Limpiar canvas
    const unlistenClear = listen("shortcut-clear-canvas", () => {
      console.log("[Tauri] Clear canvas");
      // TODO: Integrar con store de Canvas (Fase 2.15+)
    });

    // Atajo Ctrl+Z: Deshacer último objeto
    const unlistenUndo = listen("shortcut-undo", () => {
      console.log("[Tauri] Undo");
      // TODO: Integrar con store de Canvas (Fase 2.15+)
    });

    // Atajo Ctrl+H: Toggle visibilidad overlay
    const unlistenVisibility = listen("shortcut-toggle-visibility", () => {
      console.log("[Tauri] Toggle visibility");
      // TODO: Integrar con store de UI (Fase 2.15+)
    });

    // Cleanup: remover listeners al desmontar
    return () => {
      unlistenToggle.then((fn) => fn());
      unlistenClear.then((fn) => fn());
      unlistenUndo.then((fn) => fn());
      unlistenVisibility.then((fn) => fn());
    };
  }, []);
}
