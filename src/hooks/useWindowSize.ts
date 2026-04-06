// src/hooks/useWindowSize.ts
// Hook reactivo para detectar cambios en el tamaño de la ventana
// Retorna dimensiones actuales para escalar el canvas de Konva

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook que escucha cambios en el tamaño de la ventana
 * Útil para escalar el canvas de Konva cuando cambia el tamaño del overlay
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Handler para actualizar el estado cuando cambia el tamaño
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Suscribirse al evento resize
    window.addEventListener('resize', handleResize);

    // Llamar una vez para obtener el tamaño inicial correcto
    handleResize();

    // Cleanup: remover listener al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize;
