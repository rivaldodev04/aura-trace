// src/store/useCanvasStore.ts
// Store Zustand para gestión de objetos del canvas con historial de 50 pasos

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnyCanvasObject } from '../types/canvas';

interface CanvasState {
  // Estado actual
  objects: AnyCanvasObject[];
  selectedId: string | null;
  
  // Historial para undo/redo (máximo 50 pasos)
  history: AnyCanvasObject[][];
  historyIndex: number;
  maxHistorySteps: number;
}

interface CanvasActions {
  // CRUD básico
  addObject: (obj: AnyCanvasObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<AnyCanvasObject>) => void;
  clearCanvas: () => void;
  
  // Selección
  selectObject: (id: string | null) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasState & CanvasActions>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      objects: [],
      selectedId: null,
      history: [[]], // Empezamos con un estado vacío en el historial
      historyIndex: 0,
      maxHistorySteps: MAX_HISTORY,

      // Agregar objeto y guardar en historial
      addObject: (obj) => {
        set((state) => {
          // Truncar historial futuro si estamos en medio del historial
          state.history = state.history.slice(0, state.historyIndex + 1);
          
          // Agregar nuevo estado al historial
          const newObjects = [...state.objects, obj];
          state.history.push(newObjects);
          
          // Limitar historial a 50 pasos
          if (state.history.length > state.maxHistorySteps) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
          
          state.objects = newObjects;
        });
      },

      // Eliminar objeto
      removeObject: (id) => {
        set((state) => {
          state.history = state.history.slice(0, state.historyIndex + 1);
          
          const newObjects = state.objects.filter((obj) => obj.id !== id);
          state.history.push(newObjects);
          
          if (state.history.length > state.maxHistorySteps) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
          
          state.objects = newObjects;
          if (state.selectedId === id) {
            state.selectedId = null;
          }
        });
      },

      // Actualizar objeto
      updateObject: (id, updates) => {
        set((state) => {
          const index = state.objects.findIndex((obj) => obj.id === id);
          if (index !== -1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
            
            const newObjects = state.objects.map((obj, i) =>
              i === index ? { ...obj, ...updates } as AnyCanvasObject : obj
            );
            state.history.push(newObjects);
            
            if (state.history.length > state.maxHistorySteps) {
              state.history.shift();
            } else {
              state.historyIndex++;
            }
            
            state.objects = newObjects;
          }
        });
      },

      // Limpiar canvas
      clearCanvas: () => {
        set((state) => {
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([]);
          
          if (state.history.length > state.maxHistorySteps) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
          
          state.objects = [];
          state.selectedId = null;
        });
      },

      // Seleccionar objeto
      selectObject: (id) => {
        set((state) => {
          state.selectedId = id;
        });
      },

      // Undo: volver al estado anterior en el historial
      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.objects = state.history[state.historyIndex];
          }
        });
      },

      // Redo: avanzar al estado siguiente en el historial
      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.objects = state.history[state.historyIndex];
          }
        });
      },

      // Verificar si se puede hacer undo
      canUndo: () => {
        return get().historyIndex > 0;
      },

      // Verificar si se puede hacer redo
      canRedo: () => {
        return get().historyIndex < get().history.length - 1;
      },
    })),
    {
      name: 'aura-trace-canvas',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        objects: state.objects,
        history: state.history,
        historyIndex: state.historyIndex 
      }),
    }
  )
);
