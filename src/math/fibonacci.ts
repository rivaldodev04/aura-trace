// src/math/fibonacci.ts
// Cálculo de niveles de Fibonacci para análisis técnico
// Soporta swings alcistas (A abajo, B arriba) y bajistas (A arriba, B abajo)

import type { Point, FibonacciLevel } from '../types/canvas';

// Ratios reducidos estilo TradingView/OlympTrade: 0, 0.236, 0.382, 0.5, 0.618, 1.0
// Punto A (inicio) = 100% (1.0), Punto B (fin) = 0% (0.0)
const FIBONACCI_RATIOS = [
  { ratio: 0.0, label: '0%', isKeyLevel: true },      // 0% en punto B
  { ratio: 0.236, label: '23.6%', isKeyLevel: false },
  { ratio: 0.382, label: '38.2%', isKeyLevel: false },
  { ratio: 0.5, label: '50%', isKeyLevel: true },     // Blanco - importante
  { ratio: 0.618, label: '61.8%', isKeyLevel: true }, // Blanco - golden ratio
  { ratio: 1.0, label: '100%', isKeyLevel: true },    // 100% en punto A
];

/**
 * Colores estilo TradingView:
 * - 0.5 y 0.618: blanco (los más importantes)
 * - Resto: azul
 */
const LEVEL_COLORS: Record<number, string> = {
  0.0: '#00AAFF',    // Azul
  0.236: '#00AAFF',  // Azul
  0.382: '#00AAFF',  // Azul
  0.5: '#FFFFFF',    // Blanco - importante
  0.618: '#FFFFFF',  // Blanco - golden ratio
  1.0: '#00AAFF',    // Azul
};

/**
 * Calcula los niveles de Fibonacci entre dos puntos (estilo TradingView).
 * 
 * Punto A (inicio del dibujo) = 100% (arriba en swing alcista)
 * Punto B (fin del dibujo) = 0% (abajo en swing alcista)
 * 
 * @param pointA - Punto de inicio (100%)
 * @param pointB - Punto final (0%)
 * @returns Array de 6 niveles de Fibonacci
 */
export function calculateFibonacciLevels(pointA: Point, pointB: Point): FibonacciLevel[] {
  const priceDiff = pointB.y - pointA.y; // Diferencia: B (0%) → A (100%)

  return FIBONACCI_RATIOS.map((config) => {
    // Calcular posición Y del nivel
    // ratio 0 = pointB.y (0%), ratio 1 = pointA.y (100%)
    const y = pointB.y - priceDiff * config.ratio;

    return {
      ratio: config.ratio,
      label: config.label,
      y: Math.round(y * 100) / 100,
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
