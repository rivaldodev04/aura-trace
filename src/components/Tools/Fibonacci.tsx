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

export const Fibonacci: React.FC<FibonacciProps> = memo(({ object, isSelected: _isSelected, onClick }) => {
  const { pointA, pointB, levels, color } = object;

  // Calcular el rango de precios (Y)
  const minY = Math.min(pointA.y, pointB.y);
  const maxY = Math.max(pointA.y, pointB.y);
  const rangeY = maxY - minY;

  // Determinar dirección (alcista o bajista)
  const isBullish = pointA.y > pointB.y; // A abajo, B arriba = alcista

  // Renderizar niveles de Fibonacci
  return (
    <Group onClick={onClick} listening={true}>
      {levels.map((level) => {
        // Calcular posición Y según la dirección del swing
        const ratio = level.ratio;
        const rawY = isBullish
          ? maxY - (rangeY * ratio)  // Alcista: 0% en A (abajo), 100% en B (arriba)
          : minY + (rangeY * ratio); // Bajista: 0% en A (arriba), 100% en B (abajo)

        // Aplicar pixel alignment para líneas horizontales nítidas
        const strokeWidth = level.isKeyLevel ? 2 : 1;
        const y = snapToPixel(rawY, strokeWidth);

        return (
          <React.Fragment key={level.ratio}>
            {/* Línea horizontal del nivel */}
            <Line
              points={[pointA.x - 50, y, pointB.x + 100, y]}
              stroke={level.color || color}
              strokeWidth={level.isKeyLevel ? 2 : 1}
              dash={level.isKeyLevel ? [] : [5, 5]}
              opacity={0.8}
              perfectDrawEnabled={false}
            />
            {/* Etiqueta del ratio */}
            <Text
              x={pointB.x + 10}
              y={y - 8}
              text={level.label}
              fontSize={12}
              fill={level.color || color}
              fontStyle={level.isKeyLevel ? 'bold' : 'normal'}
            />
          </React.Fragment>
        );
      })}

      {/* Línea vertical conectora (opcional, para visualizar el swing) */}
      <Line
        points={[pointA.x, pointA.y, pointA.x, pointB.y]}
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
        dash={[3, 3]}
      />

      {/* Puntos de inicio y fin */}
      <Line
        points={[pointA.x - 5, pointA.y, pointA.x + 5, pointA.y]}
        stroke={color}
        strokeWidth={3}
      />
      <Line
        points={[pointB.x - 5, pointB.y, pointB.x + 5, pointB.y]}
        stroke={color}
        strokeWidth={3}
      />
    </Group>
  );
});

Fibonacci.displayName = 'Fibonacci';

export default Fibonacci;
