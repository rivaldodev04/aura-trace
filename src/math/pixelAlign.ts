// src/math/pixelAlign.ts
// Alineación sub-pixel para líneas nítidas en canvas
// Basado en la técnica de offset +0.5 para líneas de 1px en canvas 2D

import type { Point } from '../types/canvas';

/**
 * Alinea una coordenada a un pixel entero para líneas nítidas.
 * 
 * PROBLEMA: En canvas, una línea de 1px dibujada en coordenadas enteras (ej: x=10)
 * se renderiza entre dos píxeles físicos (9.5 y 10.5), causando antialiasing borroso.
 * 
 * SOLUCIÓN: Agregar offset +0.5 para que la línea caiga exactamente en el centro
 * del pixel físico.
 * 
 * Ejemplo:
 *   strokeWidth=1, coord=10 → snapToPixel(10, 1) = 10.5
 *   strokeWidth=2, coord=10 → snapToPixel(10, 2) = 10.0 (línea par, no necesita offset)
 * 
 * @param coord - Coordenada original (x o y)
 * @param strokeWidth - Ancho de línea en píxeles
 * @returns Coordenada ajustada para línea nítida
 */
export function snapToPixel(coord: number, strokeWidth: number = 1): number {
  // Para líneas de ancho impar (1, 3, 5...), agregar +0.5
  // Para líneas de ancho par (2, 4, 6...), mantener coordenada entera
  if (strokeWidth % 2 === 1) {
    return Math.floor(coord) + 0.5;
  }
  return Math.floor(coord);
}

/**
 * Alinea un punto completo (x, y) para líneas nítidas.
 * 
 * @param point - Punto con coordenadas x, y
 * @param strokeWidth - Ancho de línea en píxeles
 * @returns Punto ajustado
 */
export function snapPoint(point: Point, strokeWidth: number = 1): Point {
  return {
    x: snapToPixel(point.x, strokeWidth),
    y: snapToPixel(point.y, strokeWidth),
  };
}

/**
 * Snap inteligente que ajusta automáticamente según el strokeWidth.
 * Wrapper conveniente que aplica la lógica correcta sin pensar en paridad.
 * 
 * @param coord - Coordenada original
 * @param strokeWidth - Ancho de línea
 * @returns Coordenada alineada al pixel
 */
export function smartSnap(coord: number, strokeWidth: number = 1): number {
  return snapToPixel(coord, strokeWidth);
}

/**
 * Alinea un array de puntos para uso con Konva.js.
 * Konva usa arrays planos [x1, y1, x2, y2, ...] para líneas poligonales.
 * 
 * @param pointsArray - Array plano de coordenadas [x1, y1, x2, y2, ...]
 * @param strokeWidth - Ancho de línea
 * @returns Array plano con coordenadas alineadas
 */
export function snapPointsArray(
  pointsArray: number[],
  strokeWidth: number = 1
): number[] {
  return pointsArray.map((coord) => snapToPixel(coord, strokeWidth));
}

/**
 * Alinea un array de objetos Point para líneas de Konva.
 * Útil cuando se trabaja con puntos en formato objeto {x, y}.
 * 
 * @param points - Array de objetos Point
 * @param strokeWidth - Ancho de línea
 * @returns Array de puntos alineados
 */
export function snapPointObjects(
  points: Point[],
  strokeWidth: number = 1
): Point[] {
  return points.map((p) => snapPoint(p, strokeWidth));
}

/**
 * Convierte un array de objetos Point al formato plano de Konva [x1, y1, x2, y2...]
 * aplicando alineación de píxeles.
 * 
 * @param points - Array de objetos Point
 * @param strokeWidth - Ancho de línea
 * @returns Array plano [x1, y1, x2, y2, ...] listo para Konva.Line
 */
export function pointsToFlatArray(
  points: Point[],
  strokeWidth: number = 1
): number[] {
  const snapped = snapPointObjects(points, strokeWidth);
  const flat: number[] = [];

  for (const p of snapped) {
    flat.push(p.x, p.y);
  }

  return flat;
}

/**
 * Alinea las coordenadas de un rectángulo para bordes nítidos.
 * Útil para ZoneRect y otros elementos rectangulares.
 * 
 * @param x - Posición X
 * @param y - Posición Y  
 * @param width - Ancho
 * @param height - Alto
 * @param strokeWidth - Ancho de borde
 * @returns Rectángulo con coordenadas alineadas
 */
export function snapRect(
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number = 1
): { x: number; y: number; width: number; height: number } {
  return {
    x: snapToPixel(x, strokeWidth),
    y: snapToPixel(y, strokeWidth),
    width: Math.floor(width),
    height: Math.floor(height),
  };
}

export default {
  snapToPixel,
  snapPoint,
  smartSnap,
  snapPointsArray,
  snapPointObjects,
  pointsToFlatArray,
  snapRect,
};
