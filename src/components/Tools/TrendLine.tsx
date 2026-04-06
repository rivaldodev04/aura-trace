// src/components/Tools/TrendLine.tsx
// Componente para renderizar líneas de tendencia en el canvas

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type { TrendLineObject } from '../../types/canvas';

interface TrendLineProps {
  object: TrendLineObject;
  isSelected: boolean;
  onClick?: () => void;
}

export const TrendLine: React.FC<TrendLineProps> = memo(({ object, isSelected, onClick }) => {
  const [start, end] = object.points;

  return (
    <Line
      points={[start.x, start.y, end.x, end.y]}
      stroke={object.color}
      strokeWidth={object.strokeWidth}
      dash={object.dashPattern}
      hitStrokeWidth={10} // Área de clic más grande para facilitar selección
      perfectDrawEnabled={false} // Optimización de rendimiento
      listening={true}
      onClick={onClick}
      shadowEnabled={isSelected}
      shadowColor="#FFFFFF"
      shadowBlur={5}
      shadowOpacity={0.8}
    />
  );
});

TrendLine.displayName = 'TrendLine';

export default TrendLine;
