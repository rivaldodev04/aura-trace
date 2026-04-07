// src/components/Toolbar/ModeIndicator.tsx
// Indicador visual del modo actual (Overlay vs Dibujo)

import React, { memo } from 'react';

interface ModeIndicatorProps {
  isDrawingMode: boolean;
  onToggle: () => void;
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = memo(({
  isDrawingMode,
  onToggle,
}) => {
  const modeClass = isDrawingMode ? 'mode-drawing' : 'mode-overlay';
  const modeText = isDrawingMode ? 'Modo Dibujo' : 'Modo Overlay';
  const modeTitle = isDrawingMode 
    ? 'Clic para cambiar a Modo Overlay (Ctrl+D)'
    : 'Clic para cambiar a Modo Dibujo (Ctrl+D)';

  return (
    <div 
      className={`mode-indicator ${modeClass}`}
      onClick={onToggle}
      title={modeTitle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle();
        }
      }}
    >
      <span className="mode-indicator__dot" />
      <span className="mode-indicator__text">{modeText}</span>
    </div>
  );
});

ModeIndicator.displayName = 'ModeIndicator';
