import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import EditorElement from './EditorElement';

const UnitCanvas = forwardRef((props, ref) => {
  const {
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

  useImperativeHandle(ref, () => ({
    getContainer: () => containerRef.current,
  }));

  const handleCanvasClick = useCallback(
    (e) => {
      if (isPreviewMode) return;
      if (
        e.target === containerRef.current ||
        e.target.dataset?.canvasOverlay === 'true'
      ) {
        onElementSelect(null);
      }
    },
    [isPreviewMode, onElementSelect]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] min-h-[420px] max-h-[420px] bg-white overflow-hidden shrink-0"
      onClick={handleCanvasClick}
      tabIndex={0}
    >
      {/* Рамка canvas в режиме редактора */}
      {!isPreviewMode && (
        <div
          className="absolute inset-0 border-2 border-dashed border-indigo-500/50 pointer-events-none"
        />
      )}

      {/* Единая свободная рабочая область для всех элементов */}
      <div
        data-canvas-overlay="true"
        className="absolute inset-0 z-10"
      >
        {elements && elements.length > 0 ? (
          elements.map((element) => (
            <EditorElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              isPreviewMode={isPreviewMode}
              onSelect={onElementSelect}
              onUpdate={onElementUpdate}
              unitType={unitType}
              userAnswers={userAnswers}
              onUserAnswer={onUserAnswer}
              checked={checked}
              onCheckAnswers={onCheckAnswers}
            />
          ))
        ) : null}
      </div>

      {isPreviewMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300">
            Режим предпросмотра — элементы не редактируются
          </div>
        </div>
      )}
    </div>
  );
});

UnitCanvas.displayName = 'UnitCanvas';

export default UnitCanvas;
