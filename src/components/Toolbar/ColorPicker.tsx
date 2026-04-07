// src/components/Toolbar/ColorPicker.tsx
// Selector de color con presets para MiniToolbar

import React, { memo } from 'react';

interface ColorPickerProps {
  presets: string[];
  activeColor: string;
  onColorSelect: (color: string, index: number) => void;
}

// Nombres descriptivos para los colores
const ColorNames = [
  'Blanco',
  'Ámbar',
  'Verde',
  'Rojo',
  'Azul',
  'Púrpura',
];

export const ColorPicker: React.FC<ColorPickerProps> = memo(({
  presets,
  activeColor,
  onColorSelect,
}) => {
  // Dividir en filas de 3 para mejor layout
  const firstRow = presets.slice(0, 3);
  const secondRow = presets.slice(3, 6);

  const renderSwatch = (color: string, index: number) => {
    const isActive = activeColor.toLowerCase() === color.toLowerCase();
    
    return (
      <div
        key={color + index}
        className={`color-swatch ${isActive ? 'active' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => onColorSelect(color, index)}
        title={ColorNames[index] || `Color ${index + 1}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onColorSelect(color, index);
          }
        }}
      />
    );
  };

  return (
    <div className="color-picker">
      <div className="color-picker__row">
        {firstRow.map((color, index) => renderSwatch(color, index))}
      </div>
      <div className="color-picker__row">
        {secondRow.map((color, index) => renderSwatch(color, index + 3))}
      </div>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
