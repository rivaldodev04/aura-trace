// src/types/canvas.ts
// Definición exhaustiva de todos los objetos que puede contener el canvas

export type ToolType =
  | 'select'
  | 'trendline'
  | 'polyline'
  | 'fibonacci'
  | 'zone-support'
  | 'zone-resistance'
  | 'marker-success'
  | 'marker-failure';

export interface BaseObject {
  id: string;           // UUID único
  type: ToolType;
  createdAt: number;    // timestamp Unix
  isSelected: boolean;
  isVisible: boolean;
  zIndex: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TrendLineObject extends BaseObject {
  type: 'trendline';
  points: [Point, Point];  // Exactamente 2 puntos
  color: string;
  strokeWidth: number;
  dashPattern?: number[];  // Para líneas punteadas
}

export interface PolylineObject extends BaseObject {
  type: 'polyline';
  points: Point[];         // N puntos
  color: string;
  strokeWidth: number;
  closed: boolean;         // Si el último punto se conecta al primero
}

export interface FibonacciLevel {
  ratio: number;           // 0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0
  label: string;           // "0.0", "38.2%", etc.
  y: number;               // Posición Y calculada en el canvas
  color: string;
  isKeyLevel: boolean;     // 0.382, 0.5, 0.618 son niveles clave
}

export interface FibonacciObject extends BaseObject {
  type: 'fibonacci';
  pointA: Point;           // Punto de inicio del estiramiento
  pointB: Point;           // Punto final del estiramiento
  levels: FibonacciLevel[];
  color: string;
  fillOpacity: number;
}

export interface ZoneObject extends BaseObject {
  type: 'zone-support' | 'zone-resistance';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;           // Verde para soporte, Rojo para resistencia
  fillOpacity: number;     // 0.3 por defecto
  strokeColor: string;
}

export interface MarkerObject extends BaseObject {
  type: 'marker-success' | 'marker-failure';
  position: Point;
  size: number;            // Radio en píxeles
  label?: string;          // Texto opcional debajo del marcador
}

export type AnyCanvasObject =
  | TrendLineObject
  | PolylineObject
  | FibonacciObject
  | ZoneObject
  | MarkerObject;
