// src/components/Tools/Polyline.tsx
// Componente para renderizar polilíneas/zonas en el canvas

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type { PolylineObject } from '../../types/canvas';
import { snapPointsArray } from '../../math/pixelAlign';

interface PolylineProps {
  object: PolylineObject;
  isSelected: boolean;
  onClick?: () => void;
}

export const Polyline: React.FC<PolylineProps> = memo(({ object, isSelected, onClick }) => {
  // Convertir puntos a array plano [x1, y1, x2, y2, ...]
  const rawPoints = object.points.flatMap((p) => [p.x, p.y]);

  // Aplicar pixel alignment para líneas nítidas
  const points = snapPointsArray(rawPoints, object.strokeWidth);

  return (
    <Line
      points={points}
      stroke={object.color}
      strokeWidth={object.strokeWidth}
      closed={object.closed}
      fill={object.closed ? object.color : undefined}
      opacity={object.closed ? 0.3 : 1}
      hitStrokeWidth={10}
      perfectDrawEnabled={false}
      listening={true}
      onClick={onClick}
      shadowEnabled={isSelected}
      shadowColor="#FFFFFF"
      shadowBlur={5}
      shadowOpacity={0.8}
    />
  );
});

Polyline.displayName = 'Polyline';

export default Polyline;
