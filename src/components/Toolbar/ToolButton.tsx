// src/components/Toolbar/ToolButton.tsx
// Botón individual de herramienta para MiniToolbar

import React, { memo } from 'react';
import type { ToolType } from '../../types/canvas';

interface ToolButtonProps {
  tool: ToolType;
  isActive: boolean;
  onClick: () => void;
}

// Iconos SVG para cada herramienta
const ToolIcons: Record<ToolType, React.ReactNode> = {
  select: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    </svg>
  ),
  trendline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 20 9 12 15 16 21 4" />
    </svg>
  ),
  polyline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 18 8 12 13 15 21 6" />
    </svg>
  ),
  fibonacci: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="20" x2="21" y2="20" />
      <line x1="3" y1="16" x2="21" y2="16" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="8" x2="15" y2="8" />
      <line x1="3" y1="4" x2="12" y2="4" />
    </svg>
  ),
  'zone-support': (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <rect x="4" y="6" width="16" height="12" rx="2" fillOpacity="0.3" />
      <text x="12" y="14" textAnchor="middle" fontSize="8" fill="currentColor">S</text>
    </svg>
  ),
  'zone-resistance': (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <rect x="4" y="6" width="16" height="12" rx="2" fillOpacity="0.3" />
      <text x="12" y="14" textAnchor="middle" fontSize="8" fill="currentColor">R</text>
    </svg>
  ),
  'marker-success': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  ),
  'marker-failure': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  ),
};

// Labels para cada herramienta
const ToolLabels: Record<ToolType, string> = {
  select: 'Sel',
  trendline: 'Línea',
  polyline: 'Ruta',
  fibonacci: 'Fibo',
  'zone-support': 'Soporte',
  'zone-resistance': 'Resist',
  'marker-success': 'Éxito',
  'marker-failure': 'Fallo',
};

// Atajos de teclado para cada herramienta
const ToolShortcuts: Partial<Record<ToolType, string>> = {
  select: 'S',
  trendline: 'L',
  polyline: 'P',
  fibonacci: 'F',
  'zone-support': 'G',
  'zone-resistance': 'R',
  'marker-success': '1',
  'marker-failure': '2',
};

export const ToolButton: React.FC<ToolButtonProps> = memo(({ tool, isActive, onClick }) => {
  return (
    <button
      className={`tool-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={`${ToolLabels[tool]} (${ToolShortcuts[tool] || ''})`}
      data-tool={tool}
    >
      <span className="tool-button__icon">
        {ToolIcons[tool]}
      </span>
      <span className="tool-button__label">
        {ToolLabels[tool]}
      </span>
      {ToolShortcuts[tool] && (
        <kbd className="keyboard-hint">{ToolShortcuts[tool]}</kbd>
      )}
    </button>
  );
});

ToolButton.displayName = 'ToolButton';
