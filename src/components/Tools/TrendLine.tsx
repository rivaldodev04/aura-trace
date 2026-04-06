// src/components/Tools/TrendLine.tsx
// Componente para renderizar líneas de tendencia en el canvas

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type { TrendLineObject } from '../../types/canvas';
import { snapToPixel } from '../../math/pixelAlign';

interface TrendLineProps {
  object: TrendLineObject;
  isSelected: boolean;
  onClick?: () => void;
}

export const TrendLine: React.FC<TrendLineProps> = memo(({ object, isSelected, onClick }) => {
  const [start, end] = object.points;
  const strokeWidth = object.strokeWidth ?? 1;

  // Aplicar pixel alignment para líneas nítidas de 1px
  const x1 = snapToPixel(start.x, strokeWidth);
  const y1 = snapToPixel(start.y, strokeWidth);
  const x2 = snapToPixel(end.x, strokeWidth);
  const y2 = snapToPixel(end.y, strokeWidth);

  return (
    <Line
      points={[x1, y1, x2, y2]}
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
