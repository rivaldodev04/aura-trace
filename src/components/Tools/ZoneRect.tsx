// src/components/Tools/ZoneRect.tsx
// Componente para renderizar zonas de soporte/resistencia (rectángulos)

import React, { memo, useCallback } from 'react';
import { Rect, Group, Text } from 'react-konva';
import type { ZoneObject } from '../../types/canvas';
import { useCanvasStore } from '../../store/useCanvasStore';

interface ZoneRectProps {
  object: ZoneObject;
  isSelected: boolean;
  onClick?: () => void;
}

// Colores por defecto según el tipo de zona
const DEFAULT_COLORS = {
  'zone-support': '#00FF00',    // Verde para soporte
  'zone-resistance': '#FF0000', // Rojo para resistencia
};

export const ZoneRect: React.FC<ZoneRectProps> = memo(({ object, isSelected, onClick }) => {
  const { updateObject } = useCanvasStore();
  
  // Color según tipo, o el color personalizado del objeto
  const fillColor = object.color || DEFAULT_COLORS[object.type];
  const strokeColor = object.strokeColor || fillColor;
  
  // Label según el tipo
  const label = object.type === 'zone-support' ? 'SOPORTE' : 'RESISTENCIA';

  // Handler para drag - actualiza la posición del objeto
  const handleDragEnd = useCallback(
    (e: { target: { x: () => number; y: () => number } }) => {
      const newX = e.target.x();
      const newY = e.target.y();
      
      updateObject(object.id, {
        x: newX,
        y: newY,
      });
    },
    [object.id, updateObject]
  );

  return (
    <Group
      x={object.x}
      y={object.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onClick}
      listening={true}
    >
      {/* Rectángulo principal con fill semitransparente */}
      <Rect
        width={object.width}
        height={object.height}
        fill={fillColor}
        opacity={object.fillOpacity}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2 : 1}
        dash={isSelected ? [] : [5, 3]}
        perfectDrawEnabled={false}
      />
      
      {/* Label en la esquina superior */}
      <Text
        x={4}
        y={2}
        text={label}
        fontSize={10}
        fill={strokeColor}
        fontStyle="bold"
        perfectDrawEnabled={false}
      />
      
      {/* Indicador visual cuando está seleccionado */}
      {isSelected && (
        <Rect
          width={object.width}
          height={object.height}
          stroke="#FFFFFF"
          strokeWidth={1}
          dash={[2, 2]}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
});

ZoneRect.displayName = 'ZoneRect';

export default ZoneRect;
