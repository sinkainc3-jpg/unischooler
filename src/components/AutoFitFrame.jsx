import React, { useRef, useState, useEffect } from 'react';

export const BASE_WIDTH = 760;
export const BASE_HEIGHT = 680;

export default function AutoFitFrame({
  children,
  baseWidth = BASE_WIDTH,
  baseHeight = BASE_HEIGHT,
  padding = 16,
  className = '',
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - padding;
      const availableHeight = containerRef.current.clientHeight - padding;

      if (availableWidth <= 0 || availableHeight <= 0) return;

      const newScale = Math.min(
        availableWidth / baseWidth,
        availableHeight / baseHeight,
        1
      );
      setScale(Math.max(0.1, newScale));
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
  }, [baseWidth, baseHeight, padding]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex-1 flex items-center justify-center overflow-hidden p-2 relative ${className}`}
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
