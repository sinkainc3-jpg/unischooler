import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import EditorElement from './EditorElement';

const UnitCanvas = forwardRef((props, ref) => {
  const {
    imageUrl,
    elements = [],
    selectedElementId,
    isPreviewMode,
    onElementSelect,
    onElementUpdate,
    unitType,
    userAnswers = {},
    onUserAnswer,
    checked = false,
    onCheckAnswers,
  } = props;

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });

  const [imageLayout, setImageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useImperativeHandle(ref, () => ({
    getContainer: () => containerRef.current,
  }));

  // ResizeObserver для отслеживания размера canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      console.log('CANVAS SIZE', width, height);

      setContainerSize({ width, height });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // onLoad изображения — получаем naturalWidth/naturalHeight
  const handleImageLoad = useCallback((e) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    console.log('IMAGE LOADED', naturalWidth, naturalHeight);

    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageNaturalSize({ width: naturalWidth, height: naturalHeight });
    }
  }, []);

  // Вычисляем layout после получения natural размеров И размера контейнера
  useEffect(() => {
    const { width: cw, height: ch } = containerSize;
    const { width: nw, height: nh } = imageNaturalSize;

    if (cw <= 0 || ch <= 0) {
      return;
    }
    if (nw <= 0 || nh <= 0) {
      return;
    }

    const scale = Math.min(cw / nw, ch / nh);
    const displayWidth = nw * scale;
    const displayHeight = nh * scale;
    const imageX = (cw - displayWidth) / 2;
    const imageY = (ch - displayHeight) / 2;

    console.log('IMAGE LAYOUT', imageX, imageY, displayWidth, displayHeight);

    setImageLayout({
      x: imageX,
      y: imageY,
      width: displayWidth,
      height: displayHeight,
    });
  }, [containerSize, imageNaturalSize]);

  const handleCanvasClick = useCallback(
    (e) => {
      if (isPreviewMode || !imageUrl) return;

      if (
        e.target === containerRef.current ||
        e.target === imageRef.current
      ) {
        onElementSelect(null);
      }
    },
    [isPreviewMode, imageUrl, onElementSelect]
  );

  if (!imageUrl) {
    return (
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center"
      >
        <div className="text-center text-slate-500 p-8">
          <p className="text-lg">Загрузите PNG страницу</p>
          <p className="text-sm mt-1">
            Используйте панель слева
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 w-full h-full bg-slate-900 overflow-hidden"
      onClick={handleCanvasClick}
      tabIndex={0}
    >
      {/* Stage — область PNG + overlay элементов */}
      <div
        className="absolute"
        style={{
          left: imageLayout.x,
          top: imageLayout.y,
          width: imageLayout.width,
          height: imageLayout.height,
        }}
      >
        {/* PNG — всегда в DOM, когда есть imageUrl */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Unit page"
          onLoad={handleImageLoad}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            userSelect: 'none',
          }}
        />

        {/* Рамка canvas в режиме редактора */}
        {!isPreviewMode && (
          <div
            className="absolute inset-0 border-2 border-dashed border-indigo-500/50 pointer-events-none"
          />
        )}

        {/* Overlay элементов — те же размеры, что PNG */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          {elements.map((element) => (
            <EditorElement
              key={element.id}
              element={element}
              imageLayout={imageLayout}
              isSelected={element.id === selectedElementId}
              isPreviewMode={isPreviewMode}
              onSelect={onElementSelect}
              onUpdate={onElementUpdate}
              unitType={unitType}
              userAnswers={userAnswers}
              onUserAnswer={onUserAnswer}
              checked={checked}
            />
          ))}
        </div>
      </div>

      {isPreviewMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300">
            Режим предпросмотра — элементы не редактируются
          </div>
          <button
            onClick={onCheckAnswers}
            className={`px-6 py-2.5 rounded-lg font-semibold text-lg transition ${
              checked
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {checked ? 'Проверено' : 'Проверить ответ'}
          </button>
        </div>
      )}

      {imageLayout.width > 0 && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-600 bg-slate-900/50 px-2 py-1 rounded">
          {Math.round(imageLayout.width)} ×{' '}
          {Math.round(imageLayout.height)}px
        </div>
      )}
    </div>
  );
});

UnitCanvas.displayName = 'UnitCanvas';

export default UnitCanvas;