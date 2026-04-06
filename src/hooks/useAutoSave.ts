// src/hooks/useAutoSave.ts
// Hook para auto-guardado del canvas con debounce de 2 segundos

import { useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface AutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook que auto-guarda el canvas en disco cuando cambian los objetos.
 * Usa debounce para evitar guardados excesivos durante el dibujo.
 * 
 * @param objects - Array de objetos del canvas a guardar
 * @param options - Opciones de configuración (debounceMs, enabled)
 */
export function useAutoSave<T>(
  objects: T[],
  options: AutoSaveOptions = {}
) {
  const { debounceMs = 2000, enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Función para guardar en disco vía Tauri IPC
  const saveToDisk = useCallback(async (data: T[]) => {
    try {
      const jsonString = JSON.stringify(data);

      // Evitar guardar si no hay cambios desde el último guardado
      if (jsonString === lastSavedRef.current) {
        return;
      }

      await invoke('save_canvas', { canvasJson: jsonString });
      lastSavedRef.current = jsonString;
      console.log('[AutoSave] Canvas guardado en disco');
    } catch (error) {
      console.error('[AutoSave] Error guardando canvas:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout con debounce
    timeoutRef.current = setTimeout(() => {
      saveToDisk(objects);
    }, debounceMs);

    // Cleanup al desmontar o cuando cambian las dependencias
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [objects, debounceMs, enabled, saveToDisk]);

  // Función para forzar guardado inmediato (útil para cerrar app)
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveToDisk(objects);
  }, [objects, saveToDisk]);

  return { forceSave };
}

export default useAutoSave;
