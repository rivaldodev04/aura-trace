// src/math/fibonacci.ts
// Cálculo de niveles de Fibonacci para análisis técnico
// Soporta swings alcistas (A abajo, B arriba) y bajistas (A arriba, B abajo)

import type { Point, FibonacciLevel } from '../types/canvas';

// Los 9 ratios estándar de Fibonacci según MASTER_PLAN sección 7
const FIBONACCI_RATIOS = [
  { ratio: 0.0, label: '0.0', isKeyLevel: false },
  { ratio: 0.236, label: '23.6%', isKeyLevel: false },
  { ratio: 0.382, label: '38.2%', isKeyLevel: true },   // Nivel clave
  { ratio: 0.5, label: '50%', isKeyLevel: true },       // Nivel clave
  { ratio: 0.618, label: '61.8%', isKeyLevel: true },   // Nivel clave (golden ratio)
  { ratio: 0.786, label: '78.6%', isKeyLevel: false },
  { ratio: 1.0, label: '100%', isKeyLevel: false },
  { ratio: 1.272, label: '127.2%', isKeyLevel: false },
  { ratio: 1.618, label: '161.8%', isKeyLevel: false }, // Extensión clásica
];

/**
 * Colores para los niveles de Fibonacci
 * Los niveles clave (0.382, 0.5, 0.618) tienen colores más destacados
 */
const LEVEL_COLORS: Record<number, string> = {
  0.0: '#888888',
  0.236: '#888888',
  0.382: '#FFAA00',   // Ámbar para nivel clave
  0.5: '#00AAFF',     // Azul cielo para nivel clave
  0.618: '#FF00FF',   // Magenta para golden ratio
  0.786: '#888888',
  1.0: '#CCCCCC',
  1.272: '#888888',
  1.618: '#FF6600',   // Naranja para extensión
};

/**
 * Calcula los 9 niveles de Fibonacci entre dos puntos.
 * 
 * Funciona para swings ALCISTAS (A abajo, B arriba) y BAJISTAS (A arriba, B abajo).
 * El nivel 0% siempre está en pointA, el 100% en pointB.
 * 
 * @param pointA - Punto de inicio del swing (donde está el 0%)
 * @param pointB - Punto final del swing (donde está el 100%)
 * @returns Array de 9 niveles de Fibonacci con sus propiedades
 */
export function calculateFibonacciLevels(pointA: Point, pointB: Point): FibonacciLevel[] {
  // Calcular la diferencia de precio (en el eje Y)
  const priceDiff = pointB.y - pointA.y;

  // Nota: La dirección del swing (alcista/bajista) se maneja automáticamente
  // porque el cálculo priceDiff * ratio funciona en ambas direcciones.
  // Si priceDiff es negativo (swing alcista en canvas), los niveles suben.
  // Si priceDiff es positivo (swing bajista), los niveles bajan.

  // Generar los 9 niveles
  return FIBONACCI_RATIOS.map((config) => {
    // Calcular posición Y del nivel
    // ratio 0 = pointA.y, ratio 1 = pointB.y
    const y = pointA.y + priceDiff * config.ratio;

    return {
      ratio: config.ratio,
      label: config.label,
      y: Math.round(y * 100) / 100, // Redondear a 2 decimales
      color: LEVEL_COLORS[config.ratio],
      isKeyLevel: config.isKeyLevel,
    };
  });
}

/**
 * Encuentra el nivel de Fibonacci más cercano a una coordenada Y dada.
 * Útil para "snap" visual o para detectar si el mouse está cerca de un nivel.
 * 
 * @param levels - Array de niveles calculados previamente
 * @param y - Coordenada Y a evaluar (ej: posición del mouse)
 * @param threshold - Distancia máxima en píxeles para considerar "cercano" (default: 5)
 * @returns El nivel más cercano si está dentro del threshold, o null
 */
export function getNearestFibonacciLevel(
  levels: FibonacciLevel[],
  y: number,
  threshold: number = 5
): FibonacciLevel | null {
  if (!levels || levels.length === 0) {
    return null;
  }

  let nearest: FibonacciLevel | null = null;
  let minDistance = Infinity;

  for (const level of levels) {
    const distance = Math.abs(level.y - y);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = level;
    }
  }

  // Solo retornar si está dentro del threshold
  return minDistance <= threshold ? nearest : null;
}

/**
 * Obtiene el color para un ratio específico de Fibonacci.
 * @param ratio - Ratio de Fibonacci (ej: 0.618)
 * @returns Color CSS para ese nivel
 */
export function getFibonacciColor(ratio: number): string {
  return LEVEL_COLORS[ratio] || '#FFFFFF';
}

/**
 * Verifica si un ratio es un nivel clave (0.382, 0.5, 0.618).
 * @param ratio - Ratio a verificar
 * @returns true si es nivel clave
 */
export function isKeyFibonacciLevel(ratio: number): boolean {
  const config = FIBONACCI_RATIOS.find((r) => r.ratio === ratio);
  return config?.isKeyLevel ?? false;
}

export { FIBONACCI_RATIOS };
export default calculateFibonacciLevels;
