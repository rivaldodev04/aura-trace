// src/components/Canvas/AuraCanvas.tsx
// Componente principal del canvas con Stage de Konva (2 capas: objetos + preview)

import React, { useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useUIStore } from '../../store/useUIStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useDrawing } from '../../hooks/useDrawing';
import TrendLine from '../Tools/TrendLine';
import Fibonacci from '../Tools/Fibonacci';
import ZoneRect from '../Tools/ZoneRect';
import Marker from '../Tools/Marker';
import type { AnyCanvasObject } from '../../types/canvas';

export const AuraCanvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const { width, height } = useWindowSize();
  const { isDrawingMode, isCanvasVisible } = useUIStore();
  const { objects, selectedId, selectObject } = useCanvasStore();

  // Hook de dibujo: maneja mouseDown, mouseMove, mouseUp
  const { isDrawing, startPoint, currentPoint, handleMouseDown, handleMouseMove, handleMouseUp } = useDrawing();

  // No renderizar si el canvas está oculto (Ctrl+H)
  if (!isCanvasVisible) {
    return null;
  }

  // Función para renderizar objetos según su tipo
  const renderObject = (obj: AnyCanvasObject) => {
    const isSelected = obj.id === selectedId;
    const commonProps = {
      isSelected,
      onClick: () => selectObject(obj.id),
    };

    switch (obj.type) {
      case 'trendline':
        return <TrendLine key={obj.id} {...commonProps} object={obj} />;
      case 'fibonacci':
        return <Fibonacci key={obj.id} {...commonProps} object={obj} />;
      case 'zone-support':
      case 'zone-resistance':
        return <ZoneRect key={obj.id} {...commonProps} object={obj} />;
      case 'marker-success':
      case 'marker-failure':
        return <Marker key={obj.id} {...commonProps} object={obj} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isDrawingMode ? 'auto' : 'none',
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{
          background: 'transparent',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Capa de objetos existentes */}
        <Layer>
          {objects.map((obj) => renderObject(obj))}
        </Layer>

        {/* Capa de preview (objeto en creación actual) */}
        <Layer>
          {isDrawing && startPoint && currentPoint && (
            <TrendLine
              object={{
                id: 'preview',
                type: 'trendline',
                points: [startPoint, currentPoint],
                color: '#FFFFFF',
                strokeWidth: 2,
                createdAt: Date.now(),
                isSelected: false,
                isVisible: true,
                zIndex: 0,
                dashPattern: [5, 5],
              }}
              isSelected={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AuraCanvas;
