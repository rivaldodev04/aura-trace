// src/math/geometry.ts
// Utilidades geométricas para cálculos de distancia, ángulos, y detección de colisiones

import type { Point } from '../types/canvas';

/**
 * Calcula la distancia euclidiana entre dos puntos.
 * Fórmula: √((x2-x1)² + (y2-y1)²)
 * 
 * @param a - Primer punto
 * @param b - Segundo punto
 * @returns Distancia en píxeles
 */
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula el ángulo en grados entre dos puntos.
 * 0° = derecha, 90° = abajo, 180° = izquierda, 270° = arriba
 * 
 * @param a - Punto de origen
 * @param b - Punto de destino
 * @returns Ángulo en grados (0-360)
 */
export function angleDegrees(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const radians = Math.atan2(dy, dx);
  const degrees = (radians * 180) / Math.PI;
  return (degrees + 360) % 360;
}

/**
 * Calcula el punto medio entre dos puntos.
 * 
 * @param a - Primer punto
 * @param b - Segundo punto
 * @returns Punto medio
 */
export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

/**
 * Calcula la distancia perpendicular de un punto a un segmento de línea.
 * Si la proyección cae fuera del segmento, calcula la distancia al punto más cercano (A o B).
 * 
 * @param point - Punto a evaluar
 * @param segmentStart - Punto inicial del segmento (A)
 * @param segmentEnd - Punto final del segmento (B)
 * @returns Distancia mínima del punto al segmento
 */
export function distanceToSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point
): number {
  const A = point.x - segmentStart.x;
  const B = point.y - segmentStart.y;
  const C = segmentEnd.x - segmentStart.x;
  const D = segmentEnd.y - segmentStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  // Si el segmento tiene longitud 0 (mismo punto)
  if (lenSq === 0) {
    return distance(point, segmentStart);
  }

  // Calcular la proyección del punto sobre la línea infinita
  let t = dot / lenSq;

  // Limitar t al rango [0, 1] para que esté dentro del segmento
  t = Math.max(0, Math.min(1, t));

  // Calcular el punto de proyección sobre el segmento
  const projection: Point = {
    x: segmentStart.x + t * C,
    y: segmentStart.y + t * D,
  };

  return distance(point, projection);
}

/**
 * Verifica si un punto está cerca de un segmento de línea.
 * Útil para el eraser (goma de borrar) que borra cuando el mouse pasa cerca de una línea.
 * 
 * @param point - Punto a evaluar (ej: posición del mouse)
 * @param segmentStart - Punto inicial del segmento
 * @param segmentEnd - Punto final del segmento
 * @param threshold - Distancia máxima en píxeles para considerar "cerca" (default: 8px para eraser)
 * @returns true si el punto está dentro del threshold del segmento
 */
export function isPointNearSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point,
  threshold: number = 8
): boolean {
  const dist = distanceToSegment(point, segmentStart, segmentEnd);
  return dist <= threshold;
}

/**
 * Verifica si un punto está dentro de un rectángulo.
 * Útil para detectar clicks dentro de zonas de soporte/resistencia.
 * 
 * @param point - Punto a evaluar (ej: click del mouse)
 * @param rect - Rectángulo definido por x, y, width, height
 * @returns true si el punto está dentro del rectángulo
 */
export function isPointInRect(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Calcula el área de un triángulo dados sus 3 vértices.
 * Fórmula del determinante: ½|x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|
 * 
 * @param a - Primer vértice
 * @param b - Segundo vértice
 * @param c - Tercer vértice
 * @returns Área del triángulo
 */
export function triangleArea(a: Point, b: Point, c: Point): number {
  return Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2
  );
}

/**
 * Verifica si 3 puntos son colineales (están en la misma línea recta).
 * 
 * @param a - Primer punto
 * @param b - Segundo punto
 * @param c - Tercer punto
 * @param tolerance - Tolerancia en píxeles (default: 0.5)
 * @returns true si los puntos son colineales
 */
export function arePointsCollinear(
  a: Point,
  b: Point,
  c: Point,
  tolerance: number = 0.5
): boolean {
  // Si el área del triángulo es ~0, los puntos son colineales
  const area = triangleArea(a, b, c);
  return area < tolerance;
}

export default {
  distance,
  angleDegrees,
  midpoint,
  distanceToSegment,
  isPointNearSegment,
  isPointInRect,
  triangleArea,
  arePointsCollinear,
};
