// src/components/Tools/Marker.tsx
// Componente para renderizar marcadores ✅/❌ draggables

import React, { memo, useCallback } from 'react';
import { Circle, Text, Group } from 'react-konva';
import type { MarkerObject } from '../../types/canvas';
import { useCanvasStore } from '../../store/useCanvasStore';

interface MarkerProps {
  object: MarkerObject;
  isSelected: boolean;
  onClick?: () => void;
}

// Colores según tipo de marcador
const MARKER_COLORS = {
  'marker-success': '#00FF00', // Verde para éxito
  'marker-failure': '#FF0000', // Rojo para fracaso
};

// Símbolos para cada tipo
const MARKER_SYMBOLS = {
  'marker-success': '✓',
  'marker-failure': '✕',
};

export const Marker: React.FC<MarkerProps> = memo(({ object, isSelected, onClick }) => {
  const { updateObject } = useCanvasStore();
  
  const color = MARKER_COLORS[object.type];
  const symbol = MARKER_SYMBOLS[object.type];
  const { position, size, label } = object;

  // Handler para drag - actualiza la posición del objeto
  const handleDragEnd = useCallback(
    (e: { target: { x: () => number; y: () => number } }) => {
      const newX = e.target.x() + position.x;
      const newY = e.target.y() + position.y;
      
      updateObject(object.id, {
        position: { x: newX, y: newY },
      });
    },
    [object.id, position.x, position.y, updateObject]
  );

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onClick}
      listening={true}
    >
      {/* Círculo de fondo */}
      <Circle
        radius={size}
        fill="#1a1a1a"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        opacity={0.9}
        perfectDrawEnabled={false}
      />
      
      {/* Símbolo ✅ o ❌ */}
      <Text
        text={symbol}
        fontSize={size * 1.2}
        fill={color}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        x={-size * 0.5}
        y={-size * 0.6}
        width={size}
        height={size}
        perfectDrawEnabled={false}
      />
      
      {/* Glow cuando está seleccionado */}
      {isSelected && (
        <Circle
          radius={size + 4}
          stroke="#FFFFFF"
          strokeWidth={1}
          dash={[3, 3]}
          opacity={0.6}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
      
      {/* Label opcional debajo del marcador */}
      {label && (
        <Text
          text={label}
          fontSize={10}
          fill="#FFFFFF"
          align="center"
          x={-size}
          y={size + 4}
          width={size * 2}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
});

Marker.displayName = 'Marker';

export default Marker;
