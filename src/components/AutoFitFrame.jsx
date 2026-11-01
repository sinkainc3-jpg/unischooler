import React, { useRef, useState, useEffect } from 'react';

export const BASE_WIDTH = 730;
export const BASE_HEIGHT = 660;

export default function AutoFitFrame({
  children,
  baseWidth = BASE_WIDTH,
  baseHeight = BASE_HEIGHT,
  padding = 16,
  paddingX,
  paddingY,
  className = '',
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const padX = paddingX !== undefined ? paddingX : padding;
  const padY = paddingY !== undefined ? paddingY : padding;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - padX;
      const availableHeight = containerRef.current.clientHeight - padY;

      if (availableWidth <= 0 || availableHeight <= 0) return;

      const newScale = Math.min(
        availableWidth / baseWidth,
        availableHeight / baseHeight
      );
      setScale(Math.max(0.1, Math.min(newScale, 1.25)));
    };

    updateScale();

    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(updateScale);
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [baseWidth, baseHeight, padX, padY]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center overflow-hidden relative ${className}`}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
