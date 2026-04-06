// src/App.tsx
// Componente principal de Aura Trace — Integración Fase 3

import { useTauriEvents } from './hooks/useTauriEvents';
import { useAutoSave } from './hooks/useAutoSave';
import { useCanvasStore } from './store/useCanvasStore';
import { AuraCanvas } from './components/Canvas/AuraCanvas';
import './App.css';

function App() {
  // Activar listeners de atajos globales (Ctrl+D, Ctrl+Z, etc.)
  useTauriEvents();

  // Auto-guardado del canvas cada 2 segundos
  const { objects } = useCanvasStore();
  useAutoSave(objects, { debounceMs: 2000, enabled: true });

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Canvas overlay transparente */}
      <AuraCanvas />

      {/* Debug: Indicador de que la app está corriendo */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.7)',
          color: '#00FF00',
          fontSize: 12,
          fontFamily: 'monospace',
          borderRadius: 4,
          zIndex: 10001,
          pointerEvents: 'none',
        }}
      >
        Aura Trace v1.0 — Fase 3 ✅ | Objetos: {objects.length}
      </div>
    </div>
  );
}

export default App;
