// src/store/useUIStore.ts
// Store Zustand para gestión de estado UI (modo dibujo, visibilidad, etc.)

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  // Modo dibujo vs modo overlay
  isDrawingMode: boolean;
  
  // Visibilidad de la interfaz
  isToolbarVisible: boolean;
  isCanvasVisible: boolean;
  
  // Estado de carga/persistencia
  isSaving: boolean;
  lastSavedAt: number | null;
  
  // Dimensiones de la ventana
  windowWidth: number;
  windowHeight: number;
}

interface UIActions {
  // Toggle modos
  toggleDrawingMode: () => void;
  setDrawingMode: (isDrawing: boolean) => void;
  
  // Visibilidad toolbar
  toggleToolbar: () => void;
  setToolbarVisible: (visible: boolean) => void;
  
  // Visibilidad canvas (Ctrl+H)
  toggleCanvas: () => void;
  setCanvasVisible: (visible: boolean) => void;
  
  // Estado de persistencia
  setSaving: (isSaving: boolean) => void;
  markSaved: () => void;
  
  // Dimensiones
  setWindowSize: (width: number, height: number) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer((set) => ({
      // Estado inicial
      isDrawingMode: false,
      isToolbarVisible: true,
      isCanvasVisible: true,
      isSaving: false,
      lastSavedAt: null,
      windowWidth: 1920,
      windowHeight: 1080,

      // Toggle modos
      toggleDrawingMode: () => {
        set((state) => {
          state.isDrawingMode = !state.isDrawingMode;
        });
      },

      setDrawingMode: (isDrawing) => {
        set((state) => {
          state.isDrawingMode = isDrawing;
        });
      },

      // Toolbar
      toggleToolbar: () => {
        set((state) => {
          state.isToolbarVisible = !state.isToolbarVisible;
        });
      },

      setToolbarVisible: (visible) => {
        set((state) => {
          state.isToolbarVisible = visible;
        });
      },

      // Canvas visibility
      toggleCanvas: () => {
        set((state) => {
          state.isCanvasVisible = !state.isCanvasVisible;
        });
      },

      setCanvasVisible: (visible) => {
        set((state) => {
          state.isCanvasVisible = visible;
        });
      },

      // Persistencia
      setSaving: (isSaving) => {
        set((state) => {
          state.isSaving = isSaving;
        });
      },

      markSaved: () => {
        set((state) => {
          state.isSaving = false;
          state.lastSavedAt = Date.now();
        });
      },

      // Dimensiones
      setWindowSize: (width, height) => {
        set((state) => {
          state.windowWidth = width;
          state.windowHeight = height;
        });
      },
    })),
    {
      name: 'aura-trace-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isToolbarVisible: state.isToolbarVisible,
        windowWidth: state.windowWidth,
        windowHeight: state.windowHeight,
      }),
    }
  )
);
