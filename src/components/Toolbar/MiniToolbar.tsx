// src/components/Toolbar/MiniToolbar.tsx
// Barra de herramientas flotante principal - Glassmorphism minimalista

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useUIStore } from '../../store/useUIStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { ToolType } from '../../types/canvas';
import { ToolButton } from './ToolButton';
import { ColorPicker } from './ColorPicker';
import { ModeIndicator } from './ModeIndicator';
import './toolbar.css';

// Lista ordenada de herramientas para el grid 3×3
const TOOLS: ToolType[] = [
  'select',      // S
  'trendline',   // L
  'polyline',    // P
  'fibonacci',   // F
  'zone-support', // G
  'zone-resistance', // R
  'marker-success', // 1
  'marker-failure', // 2
  'eraser',      // E
];

// Tipo para posición guardada
interface ToolbarPosition {
  x: number;
  y: number;
}

const STORAGE_KEY = 'aura-toolbar-position';

// Cargar posición guardada
const loadSavedPosition = (): ToolbarPosition | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignorar errores de localStorage
  }
  return null;
};

// Guardar posición
const savePosition = (pos: ToolbarPosition) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // Ignorar errores de localStorage
  }
};

export const MiniToolbar: React.FC = () => {
  // Stores de Zustand
  const { activeTool, setActiveTool, colorPresets, strokeColor, applyColorPreset } = useToolStore();
  const { isDrawingMode, isToolbarVisible, setDrawingMode } = useUIStore();
  const { undo, clearCanvas, objects } = useCanvasStore();

  // Estado de drag
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<ToolbarPosition>(() => {
    const saved = loadSavedPosition();
    return saved || { x: 20, y: 20 };
  });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const positionStartRef = useRef<ToolbarPosition>({ x: 20, y: 20 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Persistir cambios de posición
  useEffect(() => {
    if (!isDragging) {
      savePosition(position);
    }
  }, [position, isDragging]);

  // Handlers de selección de herramienta
  const handleToolSelect = useCallback((tool: ToolType) => {
    setActiveTool(tool);

    // Si se selecciona cualquier herramienta y estamos en modo overlay,
    // sugerir activar modo dibujo (pero no forzar)
    if (!isDrawingMode && tool !== 'select') {
      // Opcional: auto-activar modo dibujo
      // setDrawingMode(true);
    }
  }, [setActiveTool, isDrawingMode]);

  // Handler de selección de color
  const handleColorSelect = useCallback((_color: string, index: number) => {
    applyColorPreset(index);
  }, [applyColorPreset]);

  // Toggle modo dibujo/overlay
  const handleModeToggle = useCallback(() => {
    const newMode = !isDrawingMode;
    setDrawingMode(newMode);

    // Llamar al backend para cambiar cursor events
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('toggle_drawing_mode').catch(console.error);
    }).catch(() => {
      // Ignorar error si Tauri no está disponible (desarrollo web)
    });
  }, [isDrawingMode, setDrawingMode]);

  // Handler de deshacer
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  // Handler de limpiar con confirmación
  const handleClear = useCallback(() => {
    if (objects.length === 0) return;

    // En una implementación real, mostrar modal de confirmación
    const confirmed = window.confirm(
      `¿Eliminar todos los objetos (${objects.length})? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      clearCanvas();
    }
  }, [clearCanvas, objects]);

  // ================= HANDLERS DE DRAG =================

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Solo drag desde el header
    const target = e.target as HTMLElement;
    if (!target.closest('.toolbar-header')) {
      return;
    }

    setIsDragging(true);

    // Obtener coordenadas iniciales
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = { x: clientX, y: clientY };
    positionStartRef.current = { ...position };

    // Prevenir selección de texto
    e.preventDefault();
  }, [position]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Calcular nueva posición con límites de pantalla
    const newX = Math.max(0, Math.min(
      window.innerWidth - 160,
      positionStartRef.current.x + deltaX
    ));
    const newY = Math.max(0, Math.min(
      window.innerHeight - 300,
      positionStartRef.current.y + deltaY
    ));

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Efectos globales de drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: true });
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Atajos de teclado para selección de herramientas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo funcionan en modo dibujo o cuando se presiona la tecla directamente
      if (!isDrawingMode) return;

      // Ignorar si está escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyMap: Record<string, ToolType> = {
        's': 'select',
        'l': 'trendline',
        'p': 'polyline',
        'f': 'fibonacci',
        'g': 'zone-support',
        'r': 'zone-resistance',
        '1': 'marker-success',
        '2': 'marker-failure',
        'e': 'eraser',
      };

      const tool = keyMap[e.key.toLowerCase()];
      if (tool) {
        e.preventDefault();
        setActiveTool(tool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingMode, setActiveTool]);

  // Si está oculto completamente (Ctrl+H), no renderizar
  if (!isToolbarVisible) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className={`aura-toolbar ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Header draggeable */}
      <div className="toolbar-header">
        <span className="toolbar-title">Aura Trace</span>
        <span className="toolbar-drag-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="2" />
            <circle cx="9" cy="12" r="2" />
            <circle cx="9" cy="18" r="2" />
            <circle cx="15" cy="6" r="2" />
            <circle cx="15" cy="12" r="2" />
            <circle cx="15" cy="18" r="2" />
          </svg>
        </span>
      </div>

      {/* Grid de herramientas 3×3 */}
      <div className="toolbar-grid">
        {TOOLS.map((tool) => (
          <ToolButton
            key={tool}
            tool={tool}
            isActive={activeTool === tool}
            onClick={() => handleToolSelect(tool)}
          />
        ))}
      </div>

      {/* Divisor */}
      <div className="toolbar-divider" />

      {/* Color Picker */}
      <ColorPicker
        presets={colorPresets}
        activeColor={strokeColor}
        onColorSelect={handleColorSelect}
      />

      {/* Divisor */}
      <div className="toolbar-divider" />

      {/* Acciones Undo/Clear */}
      <div className="toolbar-actions">
        <button
          className="toolbar-action-btn"
          onClick={handleUndo}
          disabled={objects.length === 0}
          title="Deshacer (Ctrl+Z)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Undo
        </button>
        <button
          className="toolbar-action-btn danger"
          onClick={handleClear}
          disabled={objects.length === 0}
          title="Limpiar todo (Ctrl+Shift+C)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear
        </button>
      </div>

      {/* Indicador de modo */}
      <ModeIndicator
        isDrawingMode={isDrawingMode}
        onToggle={handleModeToggle}
      />
    </div>
  );
};
