// src/components/Tools/Fibonacci.tsx
// Componente para renderizar retrocesos de Fibonacci en el canvas

import React, { memo } from 'react';
import { Line, Text, Group } from 'react-konva';
import type { FibonacciObject } from '../../types/canvas';
import { snapToPixel } from '../../math/pixelAlign';

interface FibonacciProps {
  object: FibonacciObject;
  isSelected: boolean;
  onClick?: () => void;
}

// Componente simplificado - los niveles ya vienen calculados desde fibonacci.ts
export const Fibonacci: React.FC<FibonacciProps> = memo(({ object, isSelected: _isSelected, onClick }) => {
  const { pointA, pointB, levels } = object;

  // Renderizar niveles de Fibonacci
  return (
    <Group onClick={onClick} listening={true}>
      {levels.map((level) => {
        // Aplicar pixel alignment para líneas horizontales nítidas
        const strokeWidth = level.isKeyLevel ? 2 : 1;
        const y = snapToPixel(level.y, strokeWidth);

        return (
          <React.Fragment key={level.ratio}>
            {/* Línea horizontal del nivel */}
            <Line
              points={[pointA.x - 50, y, pointB.x + 100, y]}
              stroke={level.color}
              strokeWidth={strokeWidth}
              dash={level.isKeyLevel ? [] : [5, 5]}
              opacity={0.9}
              perfectDrawEnabled={false}
            />
            {/* Etiqueta del ratio */}
            <Text
              x={pointB.x + 10}
              y={y - 8}
              text={level.label}
              fontSize={11}
              fill={level.color}
              fontStyle={level.isKeyLevel ? 'bold' : 'normal'}
            />
          </React.Fragment>
        );
      })}

      {/* Línea vertical conectora */}
      <Line
        points={[pointA.x, pointA.y, pointA.x, pointB.y]}
        stroke="#00AAFF"
        strokeWidth={1}
        opacity={0.4}
        dash={[3, 3]}
      />

      {/* Marcas de inicio (100%) y fin (0%) */}
      <Line
        points={[pointA.x - 5, pointA.y, pointA.x + 5, pointA.y]}
        stroke="#FFFFFF"
        strokeWidth={3}
      />
      <Line
        points={[pointB.x - 5, pointB.y, pointB.x + 5, pointB.y]}
        stroke="#00AAFF"
        strokeWidth={3}
      />
    </Group>
  );
});

Fibonacci.displayName = 'Fibonacci';

export default Fibonacci;
