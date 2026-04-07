// src/hooks/useDrawing.ts
// Hook para gestionar el ciclo de dibujo: mouseDown → mouseMove → mouseUp

import { useState, useCallback } from 'react';
import { useToolStore } from '../store/useToolStore';
import { useCanvasStore } from '../store/useCanvasStore';
import type { Point, AnyCanvasObject } from '../types/canvas';
import { calculateFibonacciLevels } from '../math/fibonacci';

interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  previewObject: AnyCanvasObject | null;
}

export function useDrawing() {
  const { activeTool, strokeColor, strokeWidth, fillOpacity } = useToolStore();
  const { addObject } = useCanvasStore();

  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    previewObject: null,
  });

  // Generar ID único simple
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Iniciar dibujo (mouseDown)
  const handleMouseDown = useCallback(
    (e: { evt: MouseEvent; target: { getStage: () => { getPointerPosition: () => Point | null } | null } }) => {
      if (activeTool === 'select') return;

      const stage = e.target.getStage?.();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      setDrawingState({
        isDrawing: true,
        startPoint: pos,
        currentPoint: pos,
        previewObject: null,
      });
    },
    [activeTool]
  );

  // Actualizar preview (mouseMove)
  const handleMouseMove = useCallback(
    (e: { evt: MouseEvent; target: { getStage: () => { getPointerPosition: () => Point | null } | null } }) => {
      if (!drawingState.isDrawing) return;

      const stage = e.target.getStage?.();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      setDrawingState((prev) => ({
        ...prev,
        currentPoint: pos,
      }));
    },
    [drawingState.isDrawing]
  );

  // Finalizar dibujo (mouseUp)
  const handleMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        previewObject: null,
      });
      return;
    }

    const { startPoint, currentPoint } = drawingState;
    const now = Date.now();

    // Crear objeto según la herramienta activa
    let newObject: AnyCanvasObject | null = null;

    switch (activeTool) {
      case 'trendline':
        newObject = {
          id: generateId(),
          type: 'trendline',
          points: [startPoint, currentPoint],
          color: strokeColor,
          strokeWidth,
          createdAt: now,
          isSelected: false,
          isVisible: true,
          zIndex: 0,
        };
        break;

      case 'polyline':
        newObject = {
          id: generateId(),
          type: 'polyline',
          points: [startPoint, currentPoint],
          color: strokeColor,
          strokeWidth,
          closed: false,
          createdAt: now,
          isSelected: false,
          isVisible: true,
          zIndex: 0,
        };
        break;

      case 'zone-support':
      case 'zone-resistance':
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);

        newObject = {
          id: generateId(),
          type: activeTool,
          x,
          y,
          width,
          height,
          color: strokeColor,
          fillOpacity,
          strokeColor,
          createdAt: now,
          isSelected: false,
          isVisible: true,
          zIndex: 0,
        };
        break;

      case 'marker-success':
      case 'marker-failure':
        newObject = {
          id: generateId(),
          type: activeTool,
          position: currentPoint,
          size: 10,
          createdAt: now,
          isSelected: false,
          isVisible: true,
          zIndex: 0,
        };
        break;

      case 'fibonacci':
        newObject = {
          id: generateId(),
          type: 'fibonacci',
          pointA: startPoint,
          pointB: currentPoint,
          levels: calculateFibonacciLevels(startPoint, currentPoint),
          color: strokeColor,
          fillOpacity,
          createdAt: now,
          isSelected: false,
          isVisible: true,
          zIndex: 0,
        };
        break;

      default:
        break;
    }

    if (newObject) {
      addObject(newObject);
    }

    // Resetear estado
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      previewObject: null,
    });
  }, [drawingState, activeTool, strokeColor, strokeWidth, fillOpacity, addObject]);

  return {
    isDrawing: drawingState.isDrawing,
    startPoint: drawingState.startPoint,
    currentPoint: drawingState.currentPoint,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

export default useDrawing;
