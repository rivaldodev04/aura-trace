# Aura Trace

Overlay de análisis técnico para trading. Dibuja líneas de tendencia, canales, retrocesos de Fibonacci y figuras chartistas sobre cualquier ventana.

## Stack Tecnológico

- **Backend**: Tauri v2 (Rust)
- **Frontend**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Canvas**: Konva.js (Fase 3)
- **Gestión de estado**: Zustand (Fase 2)

## Fase Actual

**Fase 1: Configuración Nativa (Rust)** ✅ COMPLETADA

- Ventana transparente, sin bordes, siempre encima
- Atajos de teclado globales (Ctrl+D, Ctrl+Shift+C, Ctrl+Z, Ctrl+H)
- Comandos IPC para control de ventana y persistencia
- Tailwind CSS v4 configurado

## Próximas Fases

- Fase 2: Puente IPC (React ↔ Rust)
- Fase 3: Canvas con Konva.js
- Fase 4: Lógica matemática (Fibonacci, proyecciones)
- Fase 5: UI/UX Mini-Toolbar

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm tauri dev

# Compilar para producción
pnpm tauri build
```

## Estructura del Proyecto

```
src-tauri/src/
├── lib.rs                 # Entry point Tauri
├── commands/              # Comandos IPC
│   ├── window.rs
│   ├── drawing.rs
│   └── persistence.rs
├── shortcuts/             # Atajos globales
│   └── global_keys.rs
└── state/                 # Estado global
    └── app_state.rs
```

## Licencia

MIT
