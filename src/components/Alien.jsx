import React from 'react';
import alienUrl from '../../sprites/alien.png';

export default function Alien({ unitId, hint, from = 'right', onClose }) {
  const fromRight = from === 'right';

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{ top: '30%', [fromRight ? 'right' : 'left']: 0 }}
    >
      <div
        onClick={onClose}
        title="Убрать помощника"
        className={`pointer-events-auto cursor-pointer w-36 md:w-44 ${
          fromRight
            ? 'animate-[alien-fly-in-right_2.4s_cubic-bezier(0.3,0.7,0.4,1)_both]'
            : 'animate-[alien-fly-in_2.4s_cubic-bezier(0.3,0.7,0.4,1)_both]'
        }`}
      >
        <div className="animate-[alien-wobble_2s_ease-in-out_infinite]">
          <img
            src={alienUrl}
            alt="Пришелец-помощник"
            draggable="false"
            className="w-full select-none drop-shadow-[0_22px_18px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>

      <div
        key={unitId}
        className={`absolute top-[-1rem] ${
          fromRight ? 'right-36 md:right-44' : 'left-36 md:left-44'
        } w-max max-w-[16rem] md:max-w-xs pointer-events-auto animate-[alien-bubble-pop_0.45s_ease-out_2.2s_both]`}
      >
        <div className="relative bg-white text-zinc-900 rounded-2xl px-4.5 py-3 border border-zinc-200/90 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
          <span
            className={`absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white border-zinc-200/90 rotate-45 rounded-[2px] ${
              fromRight
                ? '-right-[8px] border-r border-t'
                : '-left-[8px] border-l border-b'
            }`}
          />
          <p className="text-sm font-medium leading-relaxed text-zinc-800">
            {hint || 'Тут будет подсказка...'}
          </p>
        </div>
      </div>
    </div>
  );
}
