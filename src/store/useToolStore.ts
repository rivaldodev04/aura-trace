// src/store/useToolStore.ts
// Store Zustand para gestión de herramientas activas y colores

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ToolType } from '../types/canvas';

interface ToolState {
  // Herramienta seleccionada
  activeTool: ToolType;

  // Configuración de colores
  strokeColor: string;
  fillColor: string;

  // Configuración de estilo
  strokeWidth: number;
  fillOpacity: number;

  // Presets de colores (blanco, ámbar, verde, rojo, azul, púrpura)
  colorPresets: string[];
}

interface ToolActions {
  // Selección de herramienta
  setActiveTool: (tool: ToolType) => void;

  // Configuración de colores
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;

  // Configuración de estilo
  setStrokeWidth: (width: number) => void;
  setFillOpacity: (opacity: number) => void;

  // Selección rápida de preset
  applyColorPreset: (index: number) => void;
}

// Colores según MASTER_PLAN sección 8.2
const DEFAULT_PRESETS = [
  '#FFFFFF', // blanco
  '#FFA500', // ámbar
  '#00FF00', // verde
  '#FF0000', // rojo
  '#0000FF', // azul
  '#800080', // púrpura
];

export const useToolStore = create<ToolState & ToolActions>()(
  persist(
    immer((set) => ({
      // Estado inicial
      activeTool: 'select',
      strokeColor: '#FFFFFF',
      fillColor: '#FFFFFF',
      strokeWidth: 2,
      fillOpacity: 0.3,
      colorPresets: DEFAULT_PRESETS,

      // Acciones
      setActiveTool: (tool) => {
        set((state) => {
          state.activeTool = tool;
        });
      },

      setStrokeColor: (color) => {
        set((state) => {
          state.strokeColor = color;
        });
      },

      setFillColor: (color) => {
        set((state) => {
          state.fillColor = color;
        });
      },

      setStrokeWidth: (width) => {
        set((state) => {
          state.strokeWidth = Math.max(1, Math.min(10, width));
        });
      },

      setFillOpacity: (opacity) => {
        set((state) => {
          state.fillOpacity = Math.max(0, Math.min(1, opacity));
        });
      },

      applyColorPreset: (index) => {
        set((state) => {
          if (index >= 0 && index < state.colorPresets.length) {
            state.strokeColor = state.colorPresets[index];
          }
        });
      },
    })),
    {
      name: 'aura-trace-tool',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        strokeColor: state.strokeColor,
        fillColor: state.fillColor,
        strokeWidth: state.strokeWidth,
        fillOpacity: state.fillOpacity,
      }),
    }
  )
);
