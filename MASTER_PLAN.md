# AURA TRACE — MASTER PLAN v1.0
## Overlay Profesional de Análisis Técnico para Trading
### Stack: Tauri v2 (Rust) + React 18 + TypeScript + Konva.js

---

> **GUÍA DE CONTINUIDAD PARA IAs EXTERNAS (Windsurf, Kimi, SWE-agent)**
>
> Este documento es la fuente de verdad del proyecto. Si retomas el trabajo:
> 1. Lee este archivo completo antes de escribir una sola línea de código.
> 2. Revisa `PROGRESS.md` en la raíz para ver el estado actual de cada fase.
> 3. Respeta estrictamente la arquitectura definida en la Fase 1 y la estructura de carpetas.
> 4. Nunca modifiques `src-tauri/src/main.rs` sin leer primero la sección "El Puente IPC".
> 5. El canal de comunicación frontend↔backend es EXCLUSIVAMENTE via `invoke()` de Tauri.

---

## TABLA DE CONTENIDOS

1. [Visión del Producto](#1-visión-del-producto)
2. [Stack Tecnológico y Justificación](#2-stack-tecnológico-y-justificación)
3. [Estructura de Carpetas Exhaustiva](#3-estructura-de-carpetas-exhaustiva)
4. [Fase 1 — Configuración Nativa (Rust)](#4-fase-1--configuración-nativa-rust)
5. [Fase 2 — El Puente IPC](#5-fase-2--el-puente-ipc)
6. [Fase 3 — El Canvas (React/Konva)](#6-fase-3--el-canvas-reactkonva)
7. [Fase 4 — Lógica Matemática](#7-fase-4--lógica-matemática)
8. [Fase 5 — UI/UX: Mini-Toolbar Flotante](#8-fase-5--uiux-mini-toolbar-flotante)
9. [Sistema de Estado Global (Zustand)](#9-sistema-de-estado-global-zustand)
10. [Optimización de Rendimiento](#10-optimización-de-rendimiento)
11. [Guía de Compilación y Distribución](#11-guía-de-compilación-y-distribución)
12. [Decisiones de Arquitectura (ADR)](#12-decisiones-de-arquitectura-adr)
13. [Roadmap de Versiones](#13-roadmap-de-versiones)

---

## 1. VISIÓN DEL PRODUCTO

### 1.1 Descripción

**Aura Trace** es una aplicación de escritorio nativa que renderiza un canvas de dibujo técnico
transparente sobre cualquier aplicación de trading (Olymp Trade, Antigravity, MetaTrader, etc.).
El usuario dibuja análisis técnico directamente sobre los gráficos del broker SIN capturas de
pantalla ni cambios de ventana.

### 1.2 Principios de Diseño

| Principio         | Implementación                                                        |
|-------------------|-----------------------------------------------------------------------|
| **Invisibilidad** | Click-through por defecto; el broker recibe todos los eventos del mouse |
| **Ligereza**      | Target <50 MB RAM, <2% CPU en modo reposo                             |
| **Precisión**     | Alineación de píxeles sub-pixel con Canvas 2D API                    |
| **Velocidad**     | Renderizado via Konva.js con canvas nativo (no SVG)                  |
| **Persistencia**  | Guardado automático del lienzo en JSON local                         |

### 1.3 Flujo de Uso Principal

```
[Broker abierto en pantalla]
        ↓
[Aura Trace lanzado — ventana transparente, click-through]
        ↓
[Usuario presiona Ctrl+D → activa Modo Dibujo]
        ↓
[Mini-toolbar aparece — usuario selecciona herramienta]
        ↓
[Dibuja sobre el gráfico del broker]
        ↓
[Presiona Ctrl+D nuevamente → desactiva Modo Dibujo]
        ↓
[El broker recupera todos los clics del mouse]
```

---

## 2. STACK TECNOLÓGICO Y JUSTIFICACIÓN

### 2.1 Tabla de Dependencias

```toml
# src-tauri/Cargo.toml — dependencias Rust
[dependencies]
tauri            = { version = "2.0", features = ["global-shortcut"] }
tauri-plugin-global-shortcut = "2.0"
serde            = { version = "1.0", features = ["derive"] }
serde_json       = "1.0"
tokio            = { version = "1.0", features = ["full"] }
```

```json
// package.json — dependencias frontend
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "konva": "^9.3.0",
    "react-konva": "^18.2.10",
    "zustand": "^4.5.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-global-shortcut": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 2.2 Justificación de Konva.js vs Alternativas

| Librería      | Ventaja                        | Desventaja                    | Decisión   |
|---------------|-------------------------------|-------------------------------|------------|
| Konva.js      | Canvas nativo, hit detection  | API verbosa                   | ✅ ELEGIDA  |
| Fabric.js     | API amigable                  | SVG-based, más lento          | ❌          |
| D3.js         | Potente para datos            | No diseñado para interacción  | ❌          |
| Raw Canvas    | Máxima velocidad              | Sin gestión de objetos        | ❌          |

---

## 3. ESTRUCTURA DE CARPETAS EXHAUSTIVA

```
aura-trace/
├── .github/
│   └── workflows/
│       ├── build.yml              # CI/CD para compilar en Win/Mac/Linux
│       └── release.yml            # Auto-release con tauri-action
│
├── src/                           # Frontend React + TypeScript
│   ├── main.tsx                   # Entry point de React
│   ├── App.tsx                    # Root component con lógica de modo
│   │
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── AuraCanvas.tsx     # Componente principal de Konva Stage
│   │   │   ├── AuraCanvas.css     # Estilos del canvas
│   │   │   └── index.ts           # Re-exports
│   │   │
│   │   ├── Tools/
│   │   │   ├── TrendLine.tsx      # Renderizador de línea de tendencia
│   │   │   ├── Polyline.tsx       # Renderizador de ruta multi-punto
│   │   │   ├── Fibonacci.tsx      # Renderizador de Fibo con niveles
│   │   │   ├── ZoneRect.tsx       # Rectángulo de soporte/resistencia
│   │   │   ├── Marker.tsx         # Marcador ✅/❌ con drag
│   │   │   └── index.ts
│   │   │
│   │   ├── Toolbar/
│   │   │   ├── MiniToolbar.tsx    # La barra flotante principal
│   │   │   ├── ToolButton.tsx     # Botón individual de herramienta
│   │   │   ├── ColorPicker.tsx    # Selector de color inline
│   │   │   ├── ModeIndicator.tsx  # Indicador de modo dibujo activo
│   │   │   └── index.ts
│   │   │
│   │   └── Overlay/
│   │       ├── StatusBar.tsx      # Barra de estado inferior
│   │       └── KeyHint.tsx        # Hint de atajos de teclado
│   │
│   ├── hooks/
│   │   ├── useDrawing.ts          # Hook principal de lógica de dibujo
│   │   ├── useKeyboard.ts         # Manejo de teclado local
│   │   ├── useTauriEvents.ts      # Escucha eventos del backend Rust
│   │   ├── useWindowSize.ts       # Tamaño de ventana reactivo
│   │   └── useAutoSave.ts         # Auto-guardado con debounce
│   │
│   ├── store/
│   │   ├── useCanvasStore.ts      # Store principal (Zustand)
│   │   ├── useToolStore.ts        # Herramienta activa y configuración
│   │   ├── useUIStore.ts          # Estado de la UI (toolbar visible, etc.)
│   │   └── types.ts               # Tipos compartidos del store
│   │
│   ├── math/
│   │   ├── fibonacci.ts           # Cálculo de niveles de Fibonacci
│   │   ├── geometry.ts            # Utilidades geométricas (ángulo, distancia)
│   │   ├── pixelAlign.ts          # Alineación sub-pixel para líneas nítidas
│   │   └── hitTest.ts             # Detección de click sobre objetos
│   │
│   ├── serialization/
│   │   ├── serializer.ts          # Convierte objetos Konva → JSON
│   │   ├── deserializer.ts        # JSON → objetos del store
│   │   └── schema.ts              # Definición del esquema JSON v1
│   │
│   ├── constants/
│   │   ├── tools.ts               # Enum y configuración de herramientas
│   │   ├── colors.ts              # Paleta de colores profesional
│   │   ├── shortcuts.ts           # Definición de atajos de teclado
│   │   └── fibonacci.ts           # Ratios de Fibonacci (0.0, 0.382, etc.)
│   │
│   └── types/
│       ├── canvas.ts              # Tipos de objetos del canvas
│       ├── events.ts              # Tipos de eventos IPC
│       └── global.d.ts            # Declaraciones globales TypeScript
│
├── src-tauri/                     # Backend Rust (Tauri)
│   ├── Cargo.toml                 # Dependencias Rust
│   ├── Cargo.lock
│   ├── build.rs                   # Script de compilación
│   │
│   ├── src/
│   │   ├── main.rs                # Entry point Rust + setup de ventana
│   │   ├── lib.rs                 # Re-exports y setup de plugins
│   │   │
│   │   ├── commands/
│   │   │   ├── mod.rs             # Registro de todos los comandos
│   │   │   ├── window.rs          # Comandos de control de ventana
│   │   │   ├── drawing.rs         # Comandos de estado de dibujo
│   │   │   └── persistence.rs     # Comandos de guardado/carga
│   │   │
│   │   ├── shortcuts/
│   │   │   ├── mod.rs
│   │   │   └── global_keys.rs     # Registro de atajos globales
│   │   │
│   │   └── state/
│   │       ├── mod.rs
│   │       └── app_state.rs       # Estado global de la app en Rust
│   │
│   └── tauri.conf.json            # Configuración principal de Tauri
│
├── public/
│   ├── icons/                     # Iconos de la app (generados con tauri icon)
│   └── fonts/                     # Fuentes locales (Inter, JetBrains Mono)
│
├── scripts/
│   ├── generate-icons.sh          # Script para generar todos los iconos
│   └── dev-setup.sh               # Setup inicial del entorno
│
├── MASTER_PLAN.md                 # Este archivo
├── PROGRESS.md                    # Estado actual de implementación
├── CHANGELOG.md                   # Historial de cambios
├── README.md                      # Guía rápida de instalación
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 4. FASE 1 — CONFIGURACIÓN NATIVA (RUST)

### 4.1 Inicialización del Proyecto

```bash
# Paso 1: Crear el proyecto Tauri v2
pnpm create tauri-app@latest aura-trace -- --template react-ts --manager pnpm

cd aura-trace

# Paso 2: Instalar dependencias de Tauri v2
pnpm add @tauri-apps/api@^2.0.0
pnpm add @tauri-apps/plugin-global-shortcut@^2.0.0

# Paso 3: Instalar dependencias del canvas
pnpm add konva react-konva zustand

# Paso 4: Instalar herramientas de UI
pnpm add -D tailwindcss autoprefixer postcss
pnpm dlx tailwindcss init -p
```

### 4.2 `src-tauri/Cargo.toml` — Completo

```toml
[package]
name = "aura-trace"
version = "1.0.0"
description = "Professional Trading Overlay — Aura Trace"
authors = ["Aura Trace Team"]
edition = "2021"

[lib]
name = "aura_trace_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = [] }
tauri-plugin-global-shortcut = "2.0"
tauri-plugin-fs = "2.0"
tauri-plugin-dialog = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"         # Optimizar por tamaño de binario
strip = true            # Eliminar símbolos de debug
```

### 4.3 `src-tauri/tauri.conf.json` — Configuración Crítica

```json
{
  "$schema": "https://schema.tauri.app/config/2.0.0",
  "productName": "Aura Trace",
  "version": "1.0.0",
  "identifier": "com.auratrace.overlay",

  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },

  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Aura Trace",
        "width": 1920,
        "height": 1080,

        "transparent": true,
        "decorations": false,
        "alwaysOnTop": true,
        "skipTaskbar": false,
        "resizable": false,
        "maximized": false,
        "fullscreen": false,

        "x": 0,
        "y": 0,

        "shadow": false,
        "theme": "Dark",
        "titleBarStyle": "Overlay",

        "backgroundThrottling": false
      }
    ],
    "security": {
      "csp": null
    },
    "trayIcon": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false,
      "tooltip": "Aura Trace — Trading Overlay"
    }
  },

  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "resources": ["fonts/**/*"],
    "category": "Finance",
    "shortDescription": "Professional trading analysis overlay"
  },

  "plugins": {
    "global-shortcut": {}
  }
}
```

### 4.4 `src-tauri/src/main.rs` — Entry Point Completo

```rust
// src-tauri/src/main.rs
// Aura Trace — Main Entry Point
// ARQUITECTURA: Este archivo configura la ventana principal y registra
// todos los plugins. NO debe contener lógica de negocio.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod shortcuts;
mod state;

use state::app_state::AppState;

fn main() {
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
    window.set_position(tauri::Position::Physical(
        tauri::PhysicalPosition { x: 0, y: 0 }
    ))?;

    // 4. Maximizar para cubrir toda la pantalla (sin bordes)
    // Usamos el tamaño del monitor en lugar de maximize() para evitar
    // que el sistema operativo añada márgenes.
    if let Some(monitor) = window.current_monitor()? {
        let size = monitor.size();
        window.set_size(tauri::Size::Physical(
            tauri::PhysicalSize {
                width: size.width,
                height: size.height,
            }
        ))?;
    }

    Ok(())
}
```

### 4.5 `src-tauri/src/state/app_state.rs`

```rust
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
```

---

## 5. FASE 2 — EL PUENTE IPC

### 5.1 Comandos de Ventana

```rust
// src-tauri/src/commands/window.rs
// Comandos para controlar el comportamiento de la ventana nativa

use tauri::{AppHandle, Manager, State};
use crate::state::app_state::AppState;

/// COMANDO PRINCIPAL: Alterna entre Modo Dibujo y Modo Click-Through.
/// Llamado por: Frontend cuando el usuario presiona Ctrl+D.
/// Efecto: Cambia si la ventana captura o ignora eventos del mouse.
#[tauri::command]
pub async fn toggle_drawing_mode(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let mut drawing_state = state.drawing.lock()
        .map_err(|e| format!("Error de lock: {}", e))?;

    // Invertir el estado
    drawing_state.is_drawing_mode = !drawing_state.is_drawing_mode;
    let is_drawing = drawing_state.is_drawing_mode;

    // Aplicar el cambio a la ventana nativa
    if let Some(window) = app.get_webview_window("main") {
        // Si está en modo dibujo: ventana CAPTURA clics (ignore = false)
        // Si está en modo overlay: ventana IGNORA clics (ignore = true)
        window.set_ignore_cursor_events(!is_drawing)
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
    let mut drawing_state = state.drawing.lock()
        .map_err(|e| format!("Error de lock: {}", e))?;

    drawing_state.is_drawing_mode = !enabled;

    if let Some(window) = app.get_webview_window("main") {
        window.set_ignore_cursor_events(enabled)
            .map_err(|e| format!("Error: {}", e))?;
    }

    Ok(())
}

/// Retorna el tamaño actual de la ventana (necesario para escalar el canvas).
#[tauri::command]
pub async fn get_window_size(
    app: AppHandle,
) -> Result<(u32, u32), String> {
    if let Some(window) = app.get_webview_window("main") {
        let size = window.inner_size()
            .map_err(|e| format!("Error: {}", e))?;
        Ok((size.width, size.height))
    } else {
        Err("Ventana no encontrada".to_string())
    }
}
```

### 5.2 Atajos de Teclado Globales

```rust
// src-tauri/src/shortcuts/global_keys.rs
// Registro de atajos de teclado globales que funcionan incluso cuando
// el foco está en el broker (Olymp Trade, etc.)

use tauri::AppHandle;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
};

pub fn register_shortcuts(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    // Atajo principal: Ctrl+D → Toggle Modo Dibujo
    let toggle_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyD);

    // Atajo de limpieza: Ctrl+Shift+C → Limpiar canvas completo
    let clear_shortcut = Shortcut::new(
        Some(Modifiers::CONTROL | Modifiers::SHIFT),
        Code::KeyC,
    );

    // Atajo de deshacer: Ctrl+Z → Deshacer último objeto
    let undo_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyZ);

    // Atajo de visibilidad: Ctrl+H → Ocultar/Mostrar todo el overlay
    let hide_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyH);

    app.global_shortcut().on_shortcuts(
        [toggle_shortcut, clear_shortcut, undo_shortcut, hide_shortcut],
        move |_app, shortcut, event| {
            if event.state == ShortcutState::Pressed {
                handle_shortcut(&app_handle, shortcut);
            }
        },
    )?;

    Ok(())
}

fn handle_shortcut(app: &AppHandle, shortcut: &Shortcut) {
    use tauri::Manager;

    match shortcut.key {
        Code::KeyD if shortcut.mods == Some(Modifiers::CONTROL) => {
            // Emitir evento al frontend para toggle del modo dibujo
            let _ = app.emit("shortcut-toggle-drawing", ());
        }
        Code::KeyC if shortcut.mods == Some(Modifiers::CONTROL | Modifiers::SHIFT) => {
            let _ = app.emit("shortcut-clear-canvas", ());
        }
        Code::KeyZ if shortcut.mods == Some(Modifiers::CONTROL) => {
            let _ = app.emit("shortcut-undo", ());
        }
        Code::KeyH if shortcut.mods == Some(Modifiers::CONTROL) => {
            let _ = app.emit("shortcut-toggle-visibility", ());
        }
        _ => {}
    }
}
```

### 5.3 Comandos de Persistencia

```rust
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
```

### 5.4 Hook de Tauri Events (Frontend)

```typescript
// src/hooks/useTauriEvents.ts
// Escucha eventos emitidos desde el backend Rust

import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useUIStore } from '../store/useUIStore';
import { useCanvasStore } from '../store/useCanvasStore';

export function useTauriEvents() {
  const { setDrawingMode, toggleVisibility } = useUIStore();
  const { undo, clearAll } = useCanvasStore();

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];

    const setup = async () => {
      // Evento: Atajo Ctrl+D detectado por Rust
      const unlistenToggle = await listen('shortcut-toggle-drawing', async () => {
        const isDrawing = await invoke<boolean>('toggle_drawing_mode');
        setDrawingMode(isDrawing);
      });

      // Evento: Atajo Ctrl+Shift+C detectado por Rust
      const unlistenClear = await listen('shortcut-clear-canvas', () => {
        clearAll();
      });

      // Evento: Atajo Ctrl+Z detectado por Rust
      const unlistenUndo = await listen('shortcut-undo', () => {
        undo();
      });

      // Evento: Atajo Ctrl+H detectado por Rust
      const unlistenHide = await listen('shortcut-toggle-visibility', () => {
        toggleVisibility();
      });

      // Evento: El backend confirmó el cambio de modo
      const unlistenModeChanged = await listen<boolean>(
        'drawing-mode-changed',
        ({ payload }) => {
          setDrawingMode(payload);
        }
      );

      unlisteners.push(
        unlistenToggle,
        unlistenClear,
        unlistenUndo,
        unlistenHide,
        unlistenModeChanged,
      );
    };

    setup();

    // Cleanup: remover todos los listeners al desmontar
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [setDrawingMode, toggleVisibility, undo, clearAll]);
}
```

---

## 6. FASE 3 — EL CANVAS (REACT/KONVA)

### 6.1 Tipos del Canvas

```typescript
// src/types/canvas.ts
// Definición exhaustiva de todos los objetos que puede contener el canvas

export type ToolType =
  | 'select'
  | 'trendline'
  | 'polyline'
  | 'fibonacci'
  | 'zone-support'
  | 'zone-resistance'
  | 'marker-success'
  | 'marker-failure'
  | 'eraser';

export interface BaseObject {
  id: string;           // UUID único
  type: ToolType;
  createdAt: number;    // timestamp Unix
  isSelected: boolean;
  isVisible: boolean;
  zIndex: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TrendLineObject extends BaseObject {
  type: 'trendline';
  points: [Point, Point];  // Exactamente 2 puntos
  color: string;
  strokeWidth: number;
  dashPattern?: number[];  // Para líneas punteadas
}

export interface PolylineObject extends BaseObject {
  type: 'polyline';
  points: Point[];         // N puntos
  color: string;
  strokeWidth: number;
  closed: boolean;         // Si el último punto se conecta al primero
}

export interface FibonacciLevel {
  ratio: number;           // 0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0
  label: string;           // "0.0", "38.2%", etc.
  y: number;               // Posición Y calculada en el canvas
  color: string;
  isKeyLevel: boolean;     // 0.382, 0.5, 0.618 son niveles clave
}

export interface FibonacciObject extends BaseObject {
  type: 'fibonacci';
  pointA: Point;           // Punto de inicio del estiramiento
  pointB: Point;           // Punto final del estiramiento
  levels: FibonacciLevel[];
  color: string;
  fillOpacity: number;
}

export interface ZoneObject extends BaseObject {
  type: 'zone-support' | 'zone-resistance';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;           // Verde para soporte, Rojo para resistencia
  fillOpacity: number;     // 0.3 por defecto
  strokeColor: string;
}

export interface MarkerObject extends BaseObject {
  type: 'marker-success' | 'marker-failure';
  position: Point;
  size: number;            // Radio en píxeles
  label?: string;          // Texto opcional debajo del marcador
}

export type AnyCanvasObject =
  | TrendLineObject
  | PolylineObject
  | FibonacciObject
  | ZoneObject
  | MarkerObject;
```

### 6.2 Componente Principal del Canvas

```typescript
// src/components/Canvas/AuraCanvas.tsx
// Componente raíz del canvas — gestiona el Stage de Konva y los eventos

import React, { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useDrawing } from '../../hooks/useDrawing';
import TrendLineRenderer from '../Tools/TrendLine';
import PolylineRenderer from '../Tools/Polyline';
import FibonacciRenderer from '../Tools/Fibonacci';
import ZoneRenderer from '../Tools/ZoneRect';
import MarkerRenderer from '../Tools/Marker';
import { AnyCanvasObject } from '../../types/canvas';

export const AuraCanvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const { width, height } = useWindowSize();
  const { objects, selectedId, selectObject } = useCanvasStore();
  const { activeTool } = useToolStore();
  const { isDrawingMode, isVisible } = useUIStore();

  const {
    isDrawing,
    currentPoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDrawing(stageRef);

  // Si no está visible, no renderizar nada
  if (!isVisible) return null;

  // Si no está en modo dibujo, el canvas es puramente visual (sin eventos)
  const pointerEvents = isDrawingMode ? 'auto' : 'none';

  const renderObject = (obj: AnyCanvasObject) => {
    const props = {
      key: obj.id,
      object: obj,
      isSelected: obj.id === selectedId,
      onSelect: () => selectObject(obj.id),
    };

    switch (obj.type) {
      case 'trendline':    return <TrendLineRenderer {...props} object={obj} />;
      case 'polyline':     return <PolylineRenderer {...props} object={obj} />;
      case 'fibonacci':    return <FibonacciRenderer {...props} object={obj} />;
      case 'zone-support':
      case 'zone-resistance': return <ZoneRenderer {...props} object={obj} />;
      case 'marker-success':
      case 'marker-failure':  return <MarkerRenderer {...props} object={obj} />;
      default:             return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents,
        zIndex: 9999,
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ background: 'transparent' }}
      >
        {/* Capa de objetos permanentes */}
        <Layer>
          {objects.map(renderObject)}
        </Layer>

        {/* Capa de preview (mientras dibuja) */}
        <Layer>
          {isDrawing && currentPoints.length > 0 && (
            <PreviewRenderer
              tool={activeTool}
              points={currentPoints}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AuraCanvas;
```

### 6.3 Hook de Dibujo

```typescript
// src/hooks/useDrawing.ts
// Lógica central de dibujo — maneja el ciclo mouseDown → mouseMove → mouseUp

import { useState, useCallback, RefObject } from 'react';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useCanvasStore } from '../store/useCanvasStore';
import { useToolStore } from '../store/useToolStore';
import { useUIStore } from '../store/useUIStore';
import { Point, AnyCanvasObject } from '../types/canvas';
import { calculateFibonacciLevels } from '../math/fibonacci';
import { snapToPixel } from '../math/pixelAlign';

export function useDrawing(stageRef: RefObject<Konva.Stage>) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);

  const { addObject, selectObject } = useCanvasStore();
  const { activeTool, strokeColor, strokeWidth, fillOpacity } = useToolStore();
  const { isDrawingMode } = useUIStore();

  const getRelativePointerPosition = useCallback((): Point | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return snapToPixel({ x: pos.x, y: pos.y });
  }, [stageRef]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawingMode) return;
    if (e.target !== e.target.getStage()) return; // Ignorar clicks en objetos

    const point = getRelativePointerPosition();
    if (!point) return;

    if (activeTool === 'polyline') {
      // Polyline acumula puntos con cada click
      setPolylinePoints(prev => [...prev, point]);
      setCurrentPoints(prev => [...prev, point]);
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoints([point]);
  }, [isDrawingMode, activeTool, getRelativePointerPosition]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawingMode || !isDrawing) return;

    const point = getRelativePointerPosition();
    if (!point || !startPoint) return;

    setCurrentPoints([startPoint, point]);
  }, [isDrawingMode, isDrawing, startPoint, getRelativePointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawingMode || !isDrawing) return;
    if (currentPoints.length < 2) return;

    const [pointA, pointB] = currentPoints;
    const id = uuidv4();

    let newObject: AnyCanvasObject | null = null;

    switch (activeTool) {
      case 'trendline':
        newObject = {
          id, type: 'trendline', createdAt: Date.now(),
          isSelected: false, isVisible: true, zIndex: Date.now(),
          points: [pointA, pointB],
          color: strokeColor, strokeWidth,
        };
        break;

      case 'fibonacci':
        newObject = {
          id, type: 'fibonacci', createdAt: Date.now(),
          isSelected: false, isVisible: true, zIndex: Date.now(),
          pointA, pointB,
          levels: calculateFibonacciLevels(pointA, pointB),
          color: strokeColor, fillOpacity,
        };
        break;

      case 'zone-support':
      case 'zone-resistance':
        const x = Math.min(pointA.x, pointB.x);
        const y = Math.min(pointA.y, pointB.y);
        const width = Math.abs(pointB.x - pointA.x);
        const height = Math.abs(pointB.y - pointA.y);
        newObject = {
          id, type: activeTool, createdAt: Date.now(),
          isSelected: false, isVisible: true, zIndex: Date.now(),
          x, y, width, height,
          color: activeTool === 'zone-support' ? '#22c55e' : '#ef4444',
          strokeColor: activeTool === 'zone-support' ? '#16a34a' : '#dc2626',
          fillOpacity: 0.3,
        };
        break;
    }

    if (newObject) {
      addObject(newObject);
      selectObject(id);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  }, [isDrawingMode, isDrawing, currentPoints, activeTool, addObject, selectObject,
      strokeColor, strokeWidth, fillOpacity]);

  const finalizePolyline = useCallback(() => {
    if (polylinePoints.length < 2) return;

    const id = uuidv4();
    const newObject: AnyCanvasObject = {
      id, type: 'polyline', createdAt: Date.now(),
      isSelected: false, isVisible: true, zIndex: Date.now(),
      points: polylinePoints,
      color: strokeColor, strokeWidth, closed: false,
    };

    addObject(newObject);
    selectObject(id);
    setPolylinePoints([]);
    setCurrentPoints([]);
  }, [polylinePoints, addObject, selectObject, strokeColor, strokeWidth]);

  return {
    isDrawing,
    currentPoints,
    polylinePoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    finalizePolyline,
  };
}
```

---

## 7. FASE 4 — LÓGICA MATEMÁTICA

### 7.1 Módulo Fibonacci

```typescript
// src/math/fibonacci.ts
// Cálculo preciso de niveles de Fibonacci para análisis técnico

import { Point, FibonacciLevel } from '../types/canvas';

// Ratios de Fibonacci estándar para trading
export const FIBONACCI_RATIOS: Array<{ ratio: number; label: string; isKey: boolean }> = [
  { ratio: 0.0,   label: '0.0%',    isKey: true  },
  { ratio: 0.236, label: '23.6%',   isKey: false },
  { ratio: 0.382, label: '38.2%',   isKey: true  },
  { ratio: 0.5,   label: '50.0%',   isKey: true  },
  { ratio: 0.618, label: '61.8%',   isKey: true  },
  { ratio: 0.786, label: '78.6%',   isKey: false },
  { ratio: 1.0,   label: '100.0%',  isKey: true  },
  { ratio: 1.272, label: '127.2%',  isKey: false },
  { ratio: 1.618, label: '161.8%',  isKey: false },
];

// Colores para niveles clave vs secundarios
const KEY_LEVEL_COLOR = '#f59e0b';    // Ámbar para niveles clave
const SECONDARY_LEVEL_COLOR = '#6b7280'; // Gris para secundarios

/**
 * Calcula las posiciones Y de todos los niveles de Fibonacci
 * dado un estiramiento de A (inicio) a B (fin).
 *
 * MATEMÁTICA:
 * El precio en cada nivel = precioA + (precioB - precioA) * ratio
 * Pero en coordenadas de canvas, Y crece hacia abajo.
 * Si A está ARRIBA de B (precio bajo → precio alto): invertir la fórmula
 *
 * @param pointA - Punto de inicio del estiramiento (click inicial)
 * @param pointB - Punto final del estiramiento (click final)
 * @returns Array de niveles con posición Y calculada
 */
export function calculateFibonacciLevels(
  pointA: Point,
  pointB: Point,
): FibonacciLevel[] {
  const deltaY = pointB.y - pointA.y; // Puede ser negativo (swing alcista)
  const totalHeight = Math.abs(deltaY);

  return FIBONACCI_RATIOS.map(({ ratio, label, isKey }) => {
    // Interpolación lineal entre A y B
    // ratio 0.0 → posición de pointA
    // ratio 1.0 → posición de pointB
    const y = pointA.y + deltaY * ratio;

    return {
      ratio,
      label,
      y: Math.round(y * 100) / 100,  // Redondear a 2 decimales
      color: isKey ? KEY_LEVEL_COLOR : SECONDARY_LEVEL_COLOR,
      isKeyLevel: isKey,
    };
  });
}

/**
 * Retorna el nivel de Fibonacci más cercano a un precio dado.
 * Útil para snap automático al dibujar zonas cerca de niveles Fibo.
 */
export function getNearestFibonacciLevel(
  y: number,
  levels: FibonacciLevel[],
  threshold: number = 5, // píxeles de tolerancia
): FibonacciLevel | null {
  let nearest: FibonacciLevel | null = null;
  let minDistance = Infinity;

  for (const level of levels) {
    const distance = Math.abs(level.y - y);
    if (distance < minDistance && distance <= threshold) {
      minDistance = distance;
      nearest = level;
    }
  }

  return nearest;
}
```

### 7.2 Módulo de Geometría

```typescript
// src/math/geometry.ts
// Utilidades geométricas para el canvas

import { Point } from '../types/canvas';

/** Distancia euclidiana entre dos puntos */
export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/** Ángulo en grados de la línea A→B respecto al eje horizontal */
export function angleDegrees(a: Point, b: Point): number {
  const rad = Math.atan2(b.y - a.y, b.x - a.x);
  return (rad * 180) / Math.PI;
}

/** Punto medio entre A y B */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Detecta si un punto P está cerca de un segmento AB.
 * Usado para el eraser atomic: detectar click sobre línea.
 *
 * @param p     - Punto a testear (posición del click)
 * @param a     - Inicio del segmento
 * @param b     - Fin del segmento
 * @param threshold - Tolerancia en píxeles
 */
export function isPointNearSegment(
  p: Point,
  a: Point,
  b: Point,
  threshold: number = 8,
): boolean {
  const len2 = distance(a, b) ** 2;
  if (len2 === 0) return distance(p, a) <= threshold;

  const t = Math.max(0, Math.min(1,
    ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / len2
  ));

  const projection: Point = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return distance(p, projection) <= threshold;
}

/**
 * Determina si un punto está dentro de un rectángulo.
 * Usado para detectar clicks en zonas.
 */
export function isPointInRect(
  p: Point,
  x: number, y: number,
  width: number, height: number,
): boolean {
  return p.x >= x && p.x <= x + width && p.y >= y && p.y <= y + height;
}
```

### 7.3 Alineación de Píxeles

```typescript
// src/math/pixelAlign.ts
// Técnica crítica: alinear coordenadas a la grilla de píxeles para
// evitar el anti-aliasing no deseado en líneas de 1px.

import { Point } from '../types/canvas';

/**
 * Snap de coordenadas para evitar líneas borrosas.
 *
 * PROBLEMA: Canvas 2D dibuja líneas borrosas cuando las coordenadas
 * son decimales (ej: x=100.5 genera blur de 2px por anti-aliasing).
 *
 * SOLUCIÓN: Redondear y agregar 0.5 para líneas de strokeWidth impar.
 * Esto coloca el centro del trazo exactamente en el borde del píxel.
 *
 * REFERENCIA: https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-lineto
 */
export function snapToPixel(point: Point): Point {
  return {
    x: Math.round(point.x) + 0.5,
    y: Math.round(point.y) + 0.5,
  };
}

export function snapToPixelEven(point: Point): Point {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

/**
 * Snap inteligente según el grosor del trazo.
 * Grosor impar → snapToPixel (offset de 0.5)
 * Grosor par   → snapToPixelEven (sin offset)
 */
export function smartSnap(point: Point, strokeWidth: number): Point {
  return strokeWidth % 2 === 1
    ? snapToPixel(point)
    : snapToPixelEven(point);
}

/**
 * Convierte un array plano [x1,y1,x2,y2,...] al formato de Konva
 * y aplica snap a cada par.
 */
export function snapPointsArray(points: number[], strokeWidth: number = 1): number[] {
  const result: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    const snapped = smartSnap({ x: points[i], y: points[i + 1] }, strokeWidth);
    result.push(snapped.x, snapped.y);
  }
  return result;
}
```

---

## 8. FASE 5 — UI/UX: MINI-TOOLBAR FLOTANTE

### 8.1 Diseño del MiniToolbar

```typescript
// src/components/Toolbar/MiniToolbar.tsx
// Mini-toolbar flotante tipo PointFix — moderna y no intrusiva

import React, { useState } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ToolType } from '../../types/canvas';
import ToolButton from './ToolButton';
import ColorPicker from './ColorPicker';
import ModeIndicator from './ModeIndicator';

const TOOL_CONFIG: Array<{
  tool: ToolType;
  icon: string;
  label: string;
  shortcut: string;
}> = [
  { tool: 'select',           icon: '↖',  label: 'Seleccionar',    shortcut: 'S' },
  { tool: 'trendline',        icon: '╱',  label: 'Línea Tendencia', shortcut: 'L' },
  { tool: 'polyline',         icon: '⤡',  label: 'Ruta/Polyline',  shortcut: 'P' },
  { tool: 'fibonacci',        icon: 'Φ',  label: 'Fibonacci',      shortcut: 'F' },
  { tool: 'zone-support',     icon: '▬',  label: 'Zona Soporte',   shortcut: 'G' },
  { tool: 'zone-resistance',  icon: '▬',  label: 'Zona Resist.',   shortcut: 'R' },
  { tool: 'marker-success',   icon: '✅', label: 'Entrada OK',     shortcut: '1' },
  { tool: 'marker-failure',   icon: '❌', label: 'Entrada Mal',    shortcut: '2' },
  { tool: 'eraser',           icon: '⌫',  label: 'Borrador',       shortcut: 'E' },
];

export const MiniToolbar: React.FC = () => {
  const { activeTool, setActiveTool, strokeColor, setStrokeColor } = useToolStore();
  const { isDrawingMode, isVisible } = useUIStore();
  const { clearAll, undo } = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        userSelect: 'none',
      }}
      className="aura-toolbar"
    >
      {/* Header — Drag Handle */}
      <div className="aura-toolbar-header">
        <span className="aura-brand">⬡ AURA</span>
        <ModeIndicator isActive={isDrawingMode} />
      </div>

      {/* Indicador de modo */}
      <div className={`aura-mode-badge ${isDrawingMode ? 'active' : 'passive'}`}>
        {isDrawingMode ? '✏ MODO DIBUJO' : '👁 MODO OVERLAY'}
        <kbd>Ctrl+D</kbd>
      </div>

      {/* Herramientas */}
      <div className="aura-tools-grid">
        {TOOL_CONFIG.map(({ tool, icon, label, shortcut }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            shortcut={shortcut}
            isActive={activeTool === tool}
            isZoneSupport={tool === 'zone-support'}
            isZoneResistance={tool === 'zone-resistance'}
            onClick={() => setActiveTool(tool)}
          />
        ))}
      </div>

      {/* Separador */}
      <div className="aura-divider" />

      {/* Color Picker */}
      <div className="aura-color-section">
        <span className="aura-label">Color</span>
        <ColorPicker
          value={strokeColor}
          onChange={setStrokeColor}
          presets={['#ffffff', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#a855f7']}
        />
      </div>

      {/* Acciones */}
      <div className="aura-actions">
        <button className="aura-btn-secondary" onClick={undo} title="Deshacer (Ctrl+Z)">
          ↩ Deshacer
        </button>
        <button className="aura-btn-danger" onClick={clearAll} title="Limpiar todo (Ctrl+Shift+C)">
          🗑 Limpiar
        </button>
      </div>

      {/* Footer — atajos */}
      <div className="aura-shortcut-hint">
        Ctrl+D · Toggle Modo Dibujo
      </div>
    </div>
  );
};

export default MiniToolbar;
```

### 8.2 Estilos del Toolbar (CSS)

```css
/* src/components/Toolbar/toolbar.css */
/* Diseño: glassmorphism oscuro, inspirado en herramientas pro de trading */

.aura-toolbar {
  background: rgba(10, 12, 18, 0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  width: 180px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.4);
  font-family: 'Inter', 'SF Pro', system-ui, sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  cursor: move;
  transition: box-shadow 0.2s ease;
}

.aura-toolbar:hover {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 12px 48px rgba(0, 0, 0, 0.7),
    0 4px 16px rgba(0, 0, 0, 0.5);
}

.aura-toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.aura-brand {
  font-weight: 700;
  font-size: 12px;
  color: #f59e0b;
  letter-spacing: 0.08em;
}

.aura-mode-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.aura-mode-badge.active {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.aura-mode-badge.passive {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.4);
}

.aura-mode-badge kbd {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 8px;
  font-family: 'JetBrains Mono', monospace;
}

.aura-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 10px;
}

.aura-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
}

.aura-tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
}

.aura-tool-btn.active {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}

.aura-tool-btn.zone-support.active {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.35);
  color: #22c55e;
}

.aura-tool-btn.zone-resistance.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

.aura-tool-shortcut {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 7px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.25);
}

.aura-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 8px 0;
}

.aura-color-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.aura-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}

.aura-color-presets {
  display: flex;
  gap: 4px;
}

.aura-color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.aura-color-swatch.selected {
  border-color: white;
  transform: scale(1.2);
}

.aura-actions {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.aura-btn-secondary,
.aura-btn-danger {
  flex: 1;
  padding: 5px 6px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.aura-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.aura-btn-danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}

.aura-shortcut-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 8px;
  padding-top: 4px;
}
```

---

## 9. SISTEMA DE ESTADO GLOBAL (ZUSTAND)

### 9.1 Canvas Store

```typescript
// src/store/useCanvasStore.ts
// Store principal — gestiona todos los objetos del canvas

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { AnyCanvasObject } from '../types/canvas';

interface HistoryEntry {
  objects: AnyCanvasObject[];
  timestamp: number;
}

interface CanvasStore {
  // Estado
  objects: AnyCanvasObject[];
  selectedId: string | null;
  history: HistoryEntry[];    // Para undo/redo
  historyIndex: number;

  // Acciones
  addObject: (obj: AnyCanvasObject) => void;
  updateObject: (id: string, updates: Partial<AnyCanvasObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  moveToFront: (id: string) => void;
  moveToBack: (id: string) => void;
}

const MAX_HISTORY = 50; // Máximo de pasos en el historial

export const useCanvasStore = create<CanvasStore>()(
  immer(
    persist(
      (set, get) => ({
        objects: [],
        selectedId: null,
        history: [],
        historyIndex: -1,

        addObject: (obj) => set((state) => {
          state.objects.push(obj);
          // Guardar en historial
          const snapshot: HistoryEntry = {
            objects: JSON.parse(JSON.stringify(state.objects)),
            timestamp: Date.now(),
          };
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push(snapshot);
          if (state.history.length > MAX_HISTORY) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
        }),

        updateObject: (id, updates) => set((state) => {
          const index = state.objects.findIndex(o => o.id === id);
          if (index !== -1) {
            Object.assign(state.objects[index], updates);
          }
        }),

        removeObject: (id) => set((state) => {
          state.objects = state.objects.filter(o => o.id !== id);
          if (state.selectedId === id) {
            state.selectedId = null;
          }
        }),

        selectObject: (id) => set((state) => {
          // Deseleccionar el anterior
          state.objects.forEach(o => { o.isSelected = false; });
          if (id) {
            const obj = state.objects.find(o => o.id === id);
            if (obj) obj.isSelected = true;
          }
          state.selectedId = id;
        }),

        clearAll: () => set((state) => {
          state.objects = [];
          state.selectedId = null;
        }),

        undo: () => set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.objects = JSON.parse(
              JSON.stringify(state.history[state.historyIndex].objects)
            );
          } else if (state.historyIndex === 0) {
            state.objects = [];
            state.historyIndex = -1;
          }
        }),

        redo: () => set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.objects = JSON.parse(
              JSON.stringify(state.history[state.historyIndex].objects)
            );
          }
        }),

        moveToFront: (id) => set((state) => {
          const index = state.objects.findIndex(o => o.id === id);
          if (index !== -1) {
            const [obj] = state.objects.splice(index, 1);
            state.objects.push(obj);
          }
        }),

        moveToBack: (id) => set((state) => {
          const index = state.objects.findIndex(o => o.id === id);
          if (index !== -1) {
            const [obj] = state.objects.splice(index, 1);
            state.objects.unshift(obj);
          }
        }),
      }),
      {
        name: 'aura-trace-canvas',
        // Solo persistir objetos, no el historial
        partialize: (state) => ({ objects: state.objects }),
      }
    )
  )
);
```

### 9.2 Tool Store

```typescript
// src/store/useToolStore.ts
import { create } from 'zustand';
import { ToolType } from '../types/canvas';

interface ToolStore {
  activeTool: ToolType;
  strokeColor: string;
  strokeWidth: number;
  fillOpacity: number;

  setActiveTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFillOpacity: (opacity: number) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  activeTool: 'select',
  strokeColor: '#f59e0b',
  strokeWidth: 2,
  fillOpacity: 0.3,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFillOpacity: (opacity) => set({ fillOpacity: opacity }),
}));
```

### 9.3 UI Store

```typescript
// src/store/useUIStore.ts
import { create } from 'zustand';

interface UIStore {
  isDrawingMode: boolean;
  isVisible: boolean;
  isToolbarVisible: boolean;

  setDrawingMode: (active: boolean) => void;
  toggleVisibility: () => void;
  setToolbarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDrawingMode: false,
  isVisible: true,
  isToolbarVisible: true,

  setDrawingMode: (active) => set({ isDrawingMode: active }),
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  setToolbarVisible: (visible) => set({ isToolbarVisible: visible }),
}));
```

---

## 10. OPTIMIZACIÓN DE RENDIMIENTO

### 10.1 Configuración de Vite para Producción

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => ({
  plugins: [react()],

  // Servidor de desarrollo
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },

  // Optimización de build
  build: {
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Code splitting para reducir bundle inicial
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-konva':  ['konva', 'react-konva'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
    // Comprimir assets para reducir el binario de Tauri
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
  },

  // Resolución de módulos
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}));
```

### 10.2 Memoización de Componentes Konva

```typescript
// src/components/Tools/TrendLine.tsx
// Ejemplo de optimización con React.memo y useMemo

import React, { useMemo } from 'react';
import { Line, Circle } from 'react-konva';
import { TrendLineObject } from '../../types/canvas';
import { snapPointsArray } from '../../math/pixelAlign';

interface Props {
  object: TrendLineObject;
  isSelected: boolean;
  onSelect: () => void;
}

// React.memo previene re-renders innecesarios cuando otros objetos cambian
export const TrendLineRenderer = React.memo(({ object, isSelected, onSelect }: Props) => {
  // useMemo para no recalcular el array de puntos en cada render
  const konvaPoints = useMemo(() => {
    const flat = object.points.flatMap(p => [p.x, p.y]);
    return snapPointsArray(flat, object.strokeWidth);
  }, [object.points, object.strokeWidth]);

  const handlePoints = useMemo(() => {
    return object.points.map(p => ({
      x: Math.round(p.x) + 0.5,
      y: Math.round(p.y) + 0.5,
    }));
  }, [object.points]);

  return (
    <>
      {/* Línea principal con hit area expandida para facilitar selección */}
      <Line
        points={konvaPoints}
        stroke={object.color}
        strokeWidth={object.strokeWidth}
        lineCap="round"
        lineJoin="round"
        dash={object.dashPattern}
        // Hit area más grande que el trazo visual
        hitStrokeWidth={Math.max(object.strokeWidth, 12)}
        onClick={onSelect}
        onTap={onSelect}
        perfectDrawEnabled={false}  // CRÍTICO para rendimiento
        shadowForStrokeEnabled={false}
      />

      {/* Handles de selección (solo visibles cuando está seleccionado) */}
      {isSelected && handlePoints.map((point, i) => (
        <Circle
          key={i}
          x={point.x}
          y={point.y}
          radius={5}
          fill="#f59e0b"
          stroke="white"
          strokeWidth={1.5}
          draggable
        />
      ))}
    </>
  );
});

export default TrendLineRenderer;
```

### 10.3 Auto-Save con Debounce

```typescript
// src/hooks/useAutoSave.ts
// Guarda el canvas automáticamente 2 segundos después del último cambio

import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useCanvasStore } from '../store/useCanvasStore';

const DEBOUNCE_MS = 2000;

export function useAutoSave() {
  const { objects } = useCanvasStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Cancelar el timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Programar guardado
    timeoutRef.current = setTimeout(async () => {
      try {
        const json = JSON.stringify({ version: 1, objects }, null, 0);
        await invoke('save_canvas', { canvasJson: json });
      } catch (error) {
        console.error('[AutoSave] Error guardando canvas:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [objects]);
}
```

### 10.4 Presupuesto de Memoria

| Componente          | Target RAM  | Estrategia                                      |
|---------------------|-------------|--------------------------------------------------|
| Proceso Rust (core) | ~8-12 MB    | Release build con LTO + strip                    |
| WebView (Chromium)  | ~30-35 MB   | Mínimo JS bundle, sin librerías pesadas          |
| Canvas Konva        | ~3-5 MB     | Máx. 200 objetos por canvas; limpiar capas vacías |
| **Total**           | **<50 MB**  | ✅ Dentro del objetivo                            |

---

## 11. GUÍA DE COMPILACIÓN Y DISTRIBUCIÓN

### 11.1 Comandos de Desarrollo

```bash
# Instalar dependencias (primera vez)
pnpm install

# Iniciar en modo desarrollo (hot-reload)
pnpm run tauri dev

# Compilar para producción (genera instalador)
pnpm run tauri build

# Compilar solo el frontend (sin Tauri)
pnpm run build

# Análisis del bundle
pnpm run build -- --report
```

### 11.2 Variables de Entorno

```bash
# .env.development
VITE_APP_VERSION=1.0.0-dev
VITE_DEBUG_OVERLAY=true     # Muestra bordes de debug en objetos

# .env.production
VITE_APP_VERSION=1.0.0
VITE_DEBUG_OVERLAY=false
```

### 11.3 Targets de Compilación

| OS      | Comando                          | Output                              |
|---------|----------------------------------|-------------------------------------|
| Windows | `pnpm tauri build`            | `AuraTrace_1.0.0_x64-setup.exe`    |
| macOS   | `pnpm tauri build`            | `AuraTrace_1.0.0_x64.dmg`          |
| Linux   | `pnpm tauri build`            | `aura-trace_1.0.0_amd64.deb`       |

---

## 12. DECISIONES DE ARQUITECTURA (ADR)

### ADR-001: Por qué Tauri v2 sobre Electron

**Contexto**: Necesitamos una ventana transparente nativa con click-through y acceso a atajos globales.

**Decisión**: Tauri v2.

**Razones**:
- Electron usa ~150MB RAM; Tauri usa <50MB (WebView nativo del OS).
- Tauri v2 expone `set_ignore_cursor_events()` directamente sin hacks de Node.
- El binario compilado es ~3-8MB vs ~70MB de Electron.

**Consecuencias**: No podemos usar APIs de Node.js; todo debe ir vía comandos Tauri.

---

### ADR-002: Por qué Konva.js sobre SVG para el canvas

**Contexto**: Necesitamos dibujar líneas, rectángulos y texto sobre un canvas transparente.

**Decisión**: Konva.js (Canvas 2D).

**Razones**:
- SVG renderiza lentamente con muchos elementos (>100 nodos).
- Konva usa Canvas nativo: renderizado a 60fps constante.
- Hit detection incorporada por objeto (crítico para el eraser atómico).
- `perfectDrawEnabled=false` reduce el tiempo de render en ~60%.

---

### ADR-003: Por qué Zustand sobre Redux

**Contexto**: Necesitamos estado global reactivo para el canvas y la UI.

**Decisión**: Zustand con middleware `immer` y `persist`.

**Razones**:
- Bundle size: Zustand ~1KB vs Redux Toolkit ~11KB.
- API minimalista sin boilerplate de reducers/actions.
- `persist` middleware maneja localStorage automáticamente.
- Compatible con React DevTools.

---

## 13. ROADMAP DE VERSIONES

### v1.0.0 — MVP (Este Documento)
- [x] Ventana transparente click-through
- [x] Toggle Modo Dibujo (Ctrl+D)
- [x] Línea de Tendencia
- [x] Polyline / Ruta
- [x] Fibonacci con 9 niveles
- [x] Zonas de Soporte/Resistencia
- [x] Marcadores ✅/❌
- [x] Undo/Redo (50 pasos)
- [x] Auto-save en JSON local
- [x] Mini-toolbar flotante

### v1.1.0 — Pro Tools
- [ ] Canal de precio: dos líneas paralelas (equidistant channel)
- [ ] Rectángulo de rango: box de precio alto/bajo
- [ ] Texto libre draggable
- [ ] Exportar canvas como PNG (screenshot del overlay)
- [ ] Múltiples perfiles de canvas (sesiones separadas)

### v1.2.0 — Intelligence
- [ ] Detección automática de estructura (HH, HL, LH, LL) via ML
- [ ] Snap magnético a niveles de Fibonacci cercanos
- [ ] Alertas de precio (notificación del sistema cuando precio toca zona)
- [ ] Integración con API de Olymp Trade para precio en tiempo real

### v2.0.0 — Multi-Monitor
- [ ] Soporte para múltiples monitores simultáneos
- [ ] Sincronización de canvas entre monitores
- [ ] Modo presentación (screenshot + notas)

---

## APÉNDICE A: ATAJOS DE TECLADO COMPLETOS

| Atajo          | Acción                             | Implementado en |
|----------------|------------------------------------|-----------------|
| `Ctrl+D`       | Toggle Modo Dibujo ↔ Overlay       | Rust (global)   |
| `Ctrl+Z`       | Deshacer último objeto              | Rust (global)   |
| `Ctrl+Shift+C` | Limpiar canvas completo             | Rust (global)   |
| `Ctrl+H`       | Ocultar/Mostrar overlay             | Rust (global)   |
| `S`            | Seleccionar                         | React (local)   |
| `L`            | Línea de tendencia                  | React (local)   |
| `P`            | Polyline/Ruta                       | React (local)   |
| `F`            | Fibonacci                           | React (local)   |
| `G`            | Zona de soporte (Green)             | React (local)   |
| `R`            | Zona de resistencia (Red)           | React (local)   |
| `1`            | Marcador éxito ✅                   | React (local)   |
| `2`            | Marcador fallo ❌                   | React (local)   |
| `E`            | Eraser atómico                      | React (local)   |
| `Delete`       | Borrar objeto seleccionado          | React (local)   |
| `Double-click` | Finalizar Polyline                  | React (local)   |
| `Escape`       | Cancelar dibujo actual              | React (local)   |

---

## APÉNDICE B: ESQUEMA JSON DEL CANVAS (v1)

```json
{
  "version": 1,
  "createdAt": 1720000000000,
  "updatedAt": 1720000000000,
  "objects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "trendline",
      "createdAt": 1720000000000,
      "isSelected": false,
      "isVisible": true,
      "zIndex": 1720000000000,
      "points": [
        { "x": 100.5, "y": 200.5 },
        { "x": 500.5, "y": 150.5 }
      ],
      "color": "#f59e0b",
      "strokeWidth": 2
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "fibonacci",
      "createdAt": 1720000001000,
      "isSelected": false,
      "isVisible": true,
      "zIndex": 1720000001000,
      "pointA": { "x": 200.5, "y": 400.5 },
      "pointB": { "x": 200.5, "y": 100.5 },
      "levels": [
        { "ratio": 0.0,   "label": "0.0%",   "y": 400.5, "color": "#f59e0b", "isKeyLevel": true  },
        { "ratio": 0.382, "label": "38.2%",  "y": 285.3, "color": "#f59e0b", "isKeyLevel": true  },
        { "ratio": 0.5,   "label": "50.0%",  "y": 250.5, "color": "#f59e0b", "isKeyLevel": true  },
        { "ratio": 0.618, "label": "61.8%",  "y": 215.7, "color": "#f59e0b", "isKeyLevel": true  },
        { "ratio": 1.0,   "label": "100.0%", "y": 100.5, "color": "#f59e0b", "isKeyLevel": true  }
      ],
      "color": "#f59e0b",
      "fillOpacity": 0.05
    }
  ]
}
```

---

## APÉNDICE C: CHECKLIST DE IMPLEMENTACIÓN

### Fase 1 — Configuración Nativa
- [ ] `cargo new` + estructura de carpetas creada
- [ ] `tauri.conf.json` con `transparent: true` y `decorations: false`
- [ ] `main.rs` con `set_ignore_cursor_events(true)` al inicio
- [ ] Ventana se inicia en posición (0,0) cubriendo pantalla completa
- [ ] Sistema de tray icon funcionando

### Fase 2 — El Puente IPC
- [ ] Comando `toggle_drawing_mode` registrado y funcional
- [ ] Atajo global `Ctrl+D` capturado (incluso con broker en foco)
- [ ] Eventos emitidos al frontend correctamente
- [ ] `save_canvas` y `load_canvas` funcionando con ruta de usuario

### Fase 3 — El Canvas
- [ ] Stage de Konva inicializado con tamaño de pantalla
- [ ] `useDrawing` hook con ciclo mouseDown→mouseMove→mouseUp
- [ ] Línea de tendencia dibujable y draggable
- [ ] Fibonacci dibuja los 9 niveles automáticamente
- [ ] Zonas con opacidad 0.3 en verde/rojo

### Fase 4 — Lógica Matemática
- [ ] `calculateFibonacciLevels()` testeado con swing alcista y bajista
- [ ] `snapToPixel()` aplicado a todas las coordenadas de líneas
- [ ] `isPointNearSegment()` funcionando para el eraser atómico

### Fase 5 — UI/UX
- [ ] MiniToolbar visible solo en modo dibujo
- [ ] Toolbar es draggable (posición persistida)
- [ ] Indicador de modo cambia visualmente al presionar Ctrl+D
- [ ] Undo/Redo con 50 pasos funcional

---

*Documento generado por: Senior Software Architect & Principal Engineer*
*Versión del Plan: 1.0.0*
*Fecha: 2025*
*Compatible con: Tauri v2.0+, Rust 1.77+, React 18+, Konva 9+*
