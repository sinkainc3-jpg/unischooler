import React, { useRef, useState, useEffect, useCallback } from 'react';

const HANDLE_SIZE = 12;

const MIN_ELEMENT_WIDTH = 5; // %
const MIN_ELEMENT_HEIGHT = 4; // %

// Защита от нулевых/микроскопических размеров: такой элемент не видно и не за что схватить
const normalizeSize = (width, height) => ({
  width: Math.max(MIN_ELEMENT_WIDTH, Math.min(Number(width) || 0, 100)),
  height: Math.max(MIN_ELEMENT_HEIGHT, Math.min(Number(height) || 0, 100)),
});

export default function EditorElement({
  element,
  imageLayout,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  unitType,
  userAnswers = {},
  onUserAnswer,
  checked = false,
  onCheckAnswers,
}) {
  const elementRef = useRef(null);
  const [localPosition, setLocalPosition] = useState(() => {
    const size = normalizeSize(element.width, element.height);
    return {
      x: element.x ?? 0,
      y: element.y ?? 0,
      width: size.width,
      height: size.height,
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [overlayRect, setOverlayRect] = useState(null);
  const [previewInputValue, setPreviewInputValue] = useState('');
  // Инлайн-редактирование текста по двойному клику (как в Figma)
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState('');

  const isText = element.type === 'text';
  const isChoice = element.type === 'choice';
  const isInput = element.type === 'input';
  const isImage = element.type === 'image';

  useEffect(() => {
    const size = normalizeSize(element.width, element.height);
    setLocalPosition({
      x: element.x ?? 0,
      y: element.y ?? 0,
      width: size.width,
      height: size.height,
    });
  }, [element.x, element.y, element.width, element.height]);

  useEffect(() => {
    if (elementRef.current?.parentElement) {
      const rect = elementRef.current.parentElement.getBoundingClientRect();
      setOverlayRect(rect);
    }
  }, [imageLayout]);

  const clampPosition = useCallback((x, y, width, height) => {
    const size = normalizeSize(width, height);
    const maxX = 100 - size.width;
    const maxY = 100 - size.height;
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
      width: size.width,
      height: size.height,
    };
  }, []);

  const handlePointerDown = useCallback((e, dragging = true, resizing = false, dir = null) => {
    if (isPreviewMode || isEditingText) return;

    e.stopPropagation();
    onSelect(element.id);

    const el = elementRef.current;
    if (!el || !overlayRect) return;

    if (dragging) {
      el.setPointerCapture(e.pointerId);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPos({ x: localPosition.x, y: localPosition.y, width: localPosition.width, height: localPosition.height });
    }
    if (resizing) {
      el.setPointerCapture(e.pointerId);
      setIsResizing(true);
      setResizeDir(dir);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPos({ x: localPosition.x, y: localPosition.y, width: localPosition.width, height: localPosition.height });
    }
  }, [element.id, localPosition, onSelect, isPreviewMode, overlayRect, isEditingText]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging && !isResizing) return;
    if (!overlayRect) return;

    const dx = ((e.clientX - dragStart.x) / overlayRect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / overlayRect.height) * 100;

    if (isDragging) {
      const newPos = clampPosition(
        startPos.x + dx,
        startPos.y + dy,
        startPos.width,
        startPos.height
      );
      setLocalPosition(newPos);
      onUpdate(element.id, { x: newPos.x, y: newPos.y });
    }

    if (isResizing) {
      let newWidth = startPos.width;
      let newHeight = startPos.height;
      let newX = startPos.x;
      let newY = startPos.y;

      if (resizeDir.includes('e')) newWidth = startPos.width + dx;
      if (resizeDir.includes('w')) {
        newWidth = startPos.width - dx;
        newX = startPos.x + dx;
      }
      if (resizeDir.includes('s')) newHeight = startPos.height + dy;
      if (resizeDir.includes('n')) {
        newHeight = startPos.height - dy;
        newY = startPos.y + dy;
      }

      const newPos = clampPosition(newX, newY, newWidth, newHeight);
      setLocalPosition(newPos);
      onUpdate(element.id, { x: newPos.x, y: newPos.y, width: newPos.width, height: newPos.height });
    }
  }, [isDragging, isResizing, dragStart, startPos, overlayRect, clampPosition, element.id, onUpdate, resizeDir]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging && !isResizing) return;
    const el = elementRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeDir(null);
  }, [isDragging, isResizing]);

  const handleKeyDown = useCallback((e) => {
    if (!isSelected || isPreviewMode || isEditingText) return;
    const step = e.shiftKey ? 1 : 0.1;
    let { x, y, width, height } = localPosition;
    let changed = false;

    switch (e.key) {
      case 'ArrowLeft': x = Math.max(0, x - step); changed = true; break;
      case 'ArrowRight': x = Math.min(100 - width, x + step); changed = true; break;
      case 'ArrowUp': y = Math.max(0, y - step); changed = true; break;
      case 'ArrowDown': y = Math.min(100 - height, y + step); changed = true; break;
      case 'Delete': case 'Backspace': onUpdate(element.id, { _delete: true }); return;
    }

    if (changed) {
      e.preventDefault();
      const newPos = clampPosition(x, y, width, height);
      setLocalPosition(newPos);
      onUpdate(element.id, { x: newPos.x, y: newPos.y, width: newPos.width, height: newPos.height });
    }
  }, [isSelected, isPreviewMode, isEditingText, localPosition, element.id, onUpdate, clampPosition]);

  // ========== ИНЛАЙН-РЕДАКТИРОВАНИЕ ТЕКСТА ==========
  const startTextEditing = useCallback((e) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setDraftText(element.content || '');
    setIsEditingText(true);
  }, [isPreviewMode, element.content]);

  const finishTextEditing = useCallback((save) => {
    if (!isEditingText) return;
    if (save) {
      const next = draftText;
      if (next !== (element.content || '')) {
        onUpdate(element.id, { content: next });
      }
    }
    setIsEditingText(false);
  }, [isEditingText, draftText, element.id, element.content, onUpdate]);

  useEffect(() => {
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, handleKeyDown]);

  const style = {
    position: 'absolute',
    left: `${localPosition.x}%`,
    top: `${localPosition.y}%`,
    width: `${localPosition.width}%`,
    height: `${localPosition.height}%`,
  };

  // ========== PREVIEW MODE ==========
  if (isPreviewMode) {
    if (isText) {
      return (
        <div
          ref={elementRef}
          style={style}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              fontSize: `${element.fontSize || 18}px`,
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
              color: element.textColor || '#ffffff',
              lineHeight: '1.2',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {element.content}
          </div>
        </div>
      );
    }

    if (isChoice) {
      const options = element.options || [];
      const userAnswer = userAnswers[element.id];
      const correctOptionId = element.correctOptionId;
      const isAnswered = !!userAnswer;
      const showResult = checked && isAnswered;

      const fontSize = element.fontSize || 18;
      const optionSize = element.optionSize || 18;
      const optionGap = element.optionGap || 8;
      const optionSpacing = element.optionSpacing || 8;
      const optionTextColor = element.optionTextColor || '#ffffff';

      const handleOptionChange = (optionId) => {
        if (onUserAnswer) onUserAnswer(element.id, optionId);
      };

      return (
        <div
          ref={elementRef}
          style={style}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: `${optionSpacing}px`,
              padding: '4px',
              boxSizing: 'border-box',
            }}
          >
            {options.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${optionGap}px`,
                  padding: '6px 8px',
                  background: '#fff',
                  border: '1px solid',
                  borderColor: showResult
                    ? (opt.id === correctOptionId ? '#22c55e' : (opt.id === userAnswer ? '#ef4444' : '#e5e7eb'))
                    : '#e5e7eb',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: `${fontSize}px`,
                  color: optionTextColor,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name={`choice-${element.id}`}
                  value={opt.id}
                  checked={userAnswer === opt.id}
                  onChange={() => handleOptionChange(opt.id)}
                  style={{
                    width: `${optionSize}px`,
                    height: `${optionSize}px`,
                    accentColor: '#6366f1',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{opt.text}</span>
                {showResult && opt.id === correctOptionId && (
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                )}
                {showResult && opt.id === userAnswer && opt.id !== correctOptionId && (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗</span>
                )}
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (isImage) {
      const src = element.src || '';
      return (
        <div
          ref={elementRef}
          style={style}
        >
          <img
            src={src}
            alt="Элемент-изображение"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#1e293b',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {!src && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '12px',
              background: '#0f172a',
              border: '1px dashed #334155',
              borderRadius: '4px',
            }}>
              Нет изображения
            </div>
          )}
        </div>
      );
    }

    // Preview: input IS interactive
    return (
      <div
        ref={elementRef}
        style={style}
      >
        <input
          type="text"
          value={previewInputValue}
          onChange={(e) => {
            setPreviewInputValue(e.target.value);
            if (onUserAnswer) onUserAnswer(element.id, e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onCheckAnswers) {
              onCheckAnswers();
            }
          }}
          placeholder="Ответ..."
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: '2px 6px',
            background: checked
              ? (previewInputValue.trim().toLowerCase() === element.correctAnswer?.trim().toLowerCase()
                ? '#dcfce7'
                : previewInputValue
                  ? '#fee2e2'
                  : '#fff')
              : '#fff',
            color: '#1e293b',
            border: '1px solid',
            borderColor: checked
              ? (previewInputValue.trim().toLowerCase() === element.correctAnswer?.trim().toLowerCase()
                ? '#22c55e'
                : previewInputValue
                  ? '#ef4444'
                  : '#6366f1')
              : '#6366f1',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  // ========== EDITOR MODE ==========
  const wrapperStyle = {
    ...style,
    // Даже если высота в процентах посчиталась нулевой (например, у старых элементов),
    // рамку элемента всегда видно и за неё можно схватиться мышкой
    minHeight: '24px',
    cursor: 'move',
    userSelect: 'none',
    touchAction: 'none',
  };

  // Двойной клик по тексту — инлайн-редактирование. Обработчик висит и на обёртке:
  // pointer capture перенаправляет dblclick на неё, а не на текстовый блок.
  return (
    <div
      ref={elementRef}
      onPointerDown={(e) => handlePointerDown(e, true, false)}
      onDoubleClick={isText && !isEditingText ? startTextEditing : undefined}
      onPointerMove={isDragging || isResizing ? handlePointerMove : undefined}
      onPointerUp={isDragging || isResizing ? handlePointerUp : undefined}
      onPointerCancel={isDragging || isResizing ? handlePointerUp : undefined}
      style={wrapperStyle}
    >
      {/* Selection border & background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: isSelected ? '2px solid #6366f1' : (isText ? '2px solid #22c55e' : isChoice ? '2px solid #a855f7' : isImage ? '2px solid #f59e0b' : '2px solid #6366f1'),
          borderRadius: '4px',
          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : (isText ? 'rgba(34, 197, 94, 0.1)' : isChoice ? 'rgba(168, 85, 247, 0.1)' : isImage ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)'),
          boxShadow: isSelected ? '0 0 0 2px rgba(99, 102, 241, 0.3)' : 'none',
          pointerEvents: 'none',
        }}
      >
        {unitType === 'train' && !isText && element.correctAnswer && (
          <div style={{
            position: 'absolute',
            top: '-1.2em',
            left: 0,
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#6366f1',
            whiteSpace: 'nowrap',
          }}>
            ✓ {element.correctAnswer}
          </div>
        )}
        {unitType === 'train' && isChoice && element.correctOptionId && (
          <div style={{
            position: 'absolute',
            top: '-1.2em',
            left: 0,
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a855f7',
            whiteSpace: 'nowrap',
          }}>
            ✓ {element.options?.find(o => o.id === element.correctOptionId)?.text || element.correctOptionId}
          </div>
        )}
      </div>

      {/* Text content - draggable via wrapper; двойной клик — инлайн-редактирование */}
      {isText && (
        isEditingText ? (
          <input
            type="text"
            autoFocus
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => finishTextEditing(true)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                finishTextEditing(true);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                finishTextEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              padding: '2px 4px',
              background: 'rgba(255, 255, 255, 0.97)',
              border: '2px solid #6366f1',
              borderRadius: '4px',
              outline: 'none',
              fontSize: `${element.fontSize || 18}px`,
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
              color: element.textColor || '#1e293b',
              lineHeight: '1.3',
              zIndex: 20,
              cursor: 'text',
            }}
          />
        ) : (
          <div
            onDoubleClick={startTextEditing}
            title="Двойной клик — редактировать текст"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              fontSize: `${element.fontSize || 18}px`,
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
              color: element.textColor || '#ffffff',
              textShadow: '0 0 3px #000, 1px 1px 2px #000, -1px -1px 2px #000',
              lineHeight: '1.3',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
              pointerEvents: 'auto',
              cursor: 'text',
              minHeight: '20px',
            }}
          >
            {element.content || 'Новый текст'}
          </div>
        )
      )}

      {/* Choice - NON-INTERACTIVE in editor mode */}
      {isChoice && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: `${(element.optionSpacing || 8)}px`,
            padding: '4px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {(element.options || []).slice(0, 3).map((opt) => (
            <div
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${(element.optionGap || 8)}px`,
                padding: '6px 8px',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '4px',
                fontSize: `${(element.fontSize || 18)}px`,
                color: element.optionTextColor || '#ffffff',
              }}
            >
              <div style={{
                width: `${(element.optionSize || 18)}px`,
                height: `${(element.optionSize || 18)}px`,
                border: '2px solid #a855f7',
                borderRadius: '50%',
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {opt.text}
              </span>
              {opt.id === element.correctOptionId && (
                <span style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '10px' }}>✓</span>
              )}
            </div>
          ))}
          {(element.options || []).length > 3 && (
            <div style={{
              padding: '4px 8px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
            }}>
              +{(element.options || []).length - 3} ещё
            </div>
          )}
        </div>
      )}

      {/* Image - NON-INTERACTIVE in editor mode */}
      {isImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            border: '1px dashed #334155',
            borderRadius: '4px',
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {element.src && (
            <img
              src={element.src}
              alt="Image element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          {!element.src && (
            <div style={{
              color: '#64748b',
              fontSize: '12px',
              textAlign: 'center',
            }}>
              Выберите изображение
            </div>
          )}
        </div>
      )}

      {/* Input - NON-INTERACTIVE in editor mode */}
      {isInput && (
        <input
          type="text"
          value=""
          placeholder="Ответ..."
          readOnly
          tabIndex={-1}
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            boxSizing: 'border-box',
            padding: '2px 6px',
            background: 'rgba(255,255,255,0.9)',
            color: '#1e293b',
            border: '1px solid #6366f1',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
            pointerEvents: 'none',
            cursor: 'move',
            userSelect: 'none',
          }}
        />
      )}

      {/* Selection UI: handles, delete button, coords - only when selected */}
      {isSelected && (
        <>
          {/* Coordinates label */}
          <div
            style={{
              position: 'absolute',
              top: '-1.5em',
              left: 0,
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#94a3b8',
              background: '#0f172a',
              padding: '1px 4px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {element.id} • {localPosition.x.toFixed(1)}%, {localPosition.y.toFixed(1)}% • {localPosition.width.toFixed(1)}% × {localPosition.height.toFixed(1)}%
          </div>

          {/* Delete button */}
          <div
            style={{
              position: 'absolute',
              top: '-1.5em',
              right: 0,
              width: '18px',
              height: '18px',
              background: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onPointerDown={() => onUpdate(element.id, { _delete: true })}
            title="Удалить"
          >
            ×
          </div>

          {/* Resize handles - 4 corners */}
          <div
            style={{
              position: 'absolute',
              top: -HANDLE_SIZE / 2,
              left: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              background: '#fff',
              border: '2px solid #6366f1',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => handlePointerDown(e, false, true, 'nw')}
          />
          <div
            style={{
              position: 'absolute',
              top: -HANDLE_SIZE / 2,
              right: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              background: '#fff',
              border: '2px solid #6366f1',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => handlePointerDown(e, false, true, 'ne')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -HANDLE_SIZE / 2,
              right: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              background: '#fff',
              border: '2px solid #6366f1',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => handlePointerDown(e, false, true, 'se')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -HANDLE_SIZE / 2,
              left: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              background: '#fff',
              border: '2px solid #6366f1',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => handlePointerDown(e, false, true, 'sw')}
          />
        </>
      )}
    </div>
  );
}