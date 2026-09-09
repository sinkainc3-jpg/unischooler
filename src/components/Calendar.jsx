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
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => shiftMonth(-1)}
          className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white font-bold transition active:scale-90 cursor-pointer"
          title="Предыдущий месяц"
        >
          ←
        </button>

        <div className="text-center">
          <p className="font-bold text-lg leading-tight">
            {MONTHS[view.month]} {view.year}
          </p>
          <button
            onClick={() => setView({ year: now.getFullYear(), month: now.getMonth() })}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            Сегодня
          </button>
        </div>

        <button
          onClick={() => shiftMonth(1)}
          className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white font-bold transition active:scale-90 cursor-pointer"
          title="Следующий месяц"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="h-8 flex items-center justify-center text-xs font-bold text-slate-500 uppercase"
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
                inMonth ? 'text-slate-200 border-transparent' : 'text-slate-600 border-transparent'
              } ${
                isDone
                  ? 'bg-green-500/15 border-green-400/50'
                  : isToday
                    ? 'ring-2 ring-indigo-500 font-bold'
                    : ''
              }`}
            >
              {isDone ? (
                <img
                  src={alienUrl}
                  alt="Задание выполнено"
                  draggable="false"
                  className="w-8 h-8 object-contain select-none drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                />
              ) : (
                d.getDate()
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <img src={alienUrl} alt="" draggable="false" className="w-5 h-5 object-contain select-none" />
        день с выполненным заданием
      </div>
    </div>
  );
}
