import React, { useState } from 'react';
import alienUrl from '../../sprites/alien.png';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// completedDays — массив строк 'YYYY-MM-DD', позже будет приходить из Supabase
export default function Calendar({ completedDays = [] }) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const completedSet = new Set(completedDays);

  const shiftMonth = (delta) => {
    setView((prev) => {
      const m = prev.month + delta;
      if (m < 0) return { year: prev.year - 1, month: 11 };
      if (m > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: m };
    });
  };

  const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const gridStart = new Date(view.year, view.month, 1 - offset);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="w-full max-w-md bg-zinc-900/70 backdrop-blur-2xl border border-white/10 border-t-white/20 rounded-3xl p-6 shadow-2xl shadow-black/50 select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => shiftMonth(-1)}
          className="w-8 h-8 rounded-xl bg-zinc-800/60 backdrop-blur-xl hover:bg-zinc-700/70 border border-white/10 border-t-white/20 text-zinc-200 hover:text-white transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center font-medium shadow-md shadow-black/20"
          title="Предыдущий месяц"
        >
          ←
        </button>

        <div className="text-center">
          <p className="font-semibold text-base leading-tight text-zinc-100">
            {MONTHS[view.month]} {view.year}
          </p>
          <button
            onClick={() => setView({ year: now.getFullYear(), month: now.getMonth() })}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            Сегодня
          </button>
        </div>

        <button
          onClick={() => shiftMonth(1)}
          className="w-8 h-8 rounded-xl bg-zinc-800/60 backdrop-blur-xl hover:bg-zinc-700/70 border border-white/10 border-t-white/20 text-zinc-200 hover:text-white transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center font-medium shadow-md shadow-black/20"
          title="Следующий месяц"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="h-8 flex items-center justify-center text-[11px] font-mono font-medium text-zinc-500 uppercase"
          >
            {w}
          </div>
        ))}

        {days.map((d) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === view.month;
          const isToday = isSameDay(d, now);
          const isDone = completedSet.has(key);

          return (
            <div
              key={key}
              title={isDone ? 'Задание выполнено' : undefined}
              className={`h-10 flex items-center justify-center rounded-lg text-sm border transition ${
                inMonth ? 'text-zinc-200 border-transparent' : 'text-zinc-600 border-transparent'
              } ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isToday
                    ? 'ring-1 ring-zinc-400 text-white font-semibold'
                    : ''
              }`}
            >
              {isDone ? (
                <img
                  src={alienUrl}
                  alt="Задание выполнено"
                  draggable="false"
                  className="w-8 h-8 object-contain select-none"
                />
              ) : (
                d.getDate()
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
        <img src={alienUrl} alt="" draggable="false" className="w-5 h-5 object-contain select-none" />
        день с выполненным заданием
      </div>
    </div>
  );
}
