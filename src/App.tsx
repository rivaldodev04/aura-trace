// src/App.tsx
// Componente principal de Aura Trace — Integración Fase 5 (MiniToolbar)

import { useTauriEvents } from './hooks/useTauriEvents';
import { useAutoSave } from './hooks/useAutoSave';
import { useCanvasStore } from './store/useCanvasStore';
import { useUIStore } from './store/useUIStore';
import { AuraCanvas } from './components/Canvas/AuraCanvas';
import { MiniToolbar } from './components/Toolbar';
import './App.css';

function App() {
  // Activar listeners de atajos globales (Ctrl+D, Ctrl+Z, etc.)
  useTauriEvents();

  // Auto-guardado del canvas cada 2 segundos
  const { objects } = useCanvasStore();
  useAutoSave(objects, { debounceMs: 2000, enabled: true });

  // Estado UI para mostrar/ocultar debug info
  const { isDrawingMode } = useUIStore();

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Canvas overlay transparente */}
      <AuraCanvas />

      {/* Mini Toolbar flotante - Glassmorphism */}
      <MiniToolbar />

      {/* Debug: Indicador de que la app está corriendo */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '8px 12px',
          background: isDrawingMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0,0,0,0.7)',
          color: isDrawingMode ? '#f59e0b' : '#00FF00',
          fontSize: 12,
          fontFamily: 'monospace',
          borderRadius: 4,
          zIndex: 10001,
          pointerEvents: 'none',
          border: isDrawingMode ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
          transition: 'all 0.2s ease',
        }}
      >
        Aura Trace v1.0 — Fase 5 🎨 | Objetos: {objects.length} | {isDrawingMode ? 'MODO DIBUJO' : 'MODO OVERLAY'}
      </div>
    </div>
  );
}

export default App;
