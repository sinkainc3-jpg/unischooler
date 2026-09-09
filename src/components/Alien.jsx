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
        <div className="relative bg-slate-100 text-slate-900 rounded-3xl px-5 py-3.5 border-2 border-indigo-300 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
          <span
            className={`absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-slate-100 border-indigo-300 rotate-45 rounded-[3px] ${
              fromRight
                ? '-right-[11px] border-r-2 border-t-2'
                : '-left-[11px] border-l-2 border-b-2'
            }`}
          />
          <p className="text-sm md:text-base font-semibold leading-snug">
            {hint || 'Тут будет подсказка...'}
          </p>
        </div>
      </div>
    </div>
  );
}
