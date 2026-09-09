import React from 'react';
import happyManUrl from '../../sprites/happyMan.jpg';

export default function UnitFrame({
  unitNumber = 1,
  onPrev,
  onNext,
  isFirst,
  isLast,
  onRoadmapClick,
  onNumberClick,
  onDateClick,
  onHelpClick,
  isAllCorrect,
  children
}) {
  return (
    <div className="relative w-full max-w-3xl mx-auto select-none my-4">
      
      {/* Неоновое свечение */}
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-blue-500/30 rounded-3xl blur-2xl -z-10" />

      {/* Основной контейнер рамки */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-slate-700/50">
        
        {/* Картинка рамки */}
        <img
          src="/frame.png"
          alt="Рамка юниты"
          className="w-full h-auto block select-none"
        />

        {/* 🛸 КНОПКА ПОМОЩИ (РИСУНОК UFO В УГЛУ) */}
        <button
          onClick={onHelpClick}
          title="Вызвать помощь"
          className="absolute rounded-full border-2 border-indigo-500/0 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer group z-20"
          style={{
            top: '0.8%',
            left: '1.3%',
            width: '13%',
            height: '22%',
          }}
        >
          <span className="opacity-0 group-hover:opacity-100 absolute top-1/2 left-full ml-2 -translate-y-1/2 w-max max-w-[180px] bg-indigo-600 text-[10px] text-white px-2 py-1 rounded shadow pointer-events-none transition-opacity">
            Нажми, чтобы вызвать помощь
          </span>
        </button>

        {/* ✅ КРУЖОК СМАЙЛИКА */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: '61%',
            left: '89%',
            width: '12%',
          }}
        >
          <div
            className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all duration-500 ${
              isAllCorrect
                ? 'border-green-400 bg-green-100 shadow-[0_0_18px_rgba(74,222,128,0.8)] scale-70'
                : 'border-transparent bg-transparent'
            }`}
          >
            <img
              src={happyManUrl}
              alt="Успех"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isAllCorrect ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'
              }`}
            />
          </div>
        </div>

        {/* 🔢 НОМЕР ЮНИТЫ В ОКОШКЕ */}
        <button
          onClick={onNumberClick}
          title="Открыть Road Map"
          className="absolute flex items-center justify-center font-bold text-slate-800 text-base md:text-lg z-20 cursor-pointer rounded-md transition-all duration-150 hover:bg-indigo-500/25 hover:text-indigo-900 hover:scale-110 focus:outline-none"
          style={{
            top: '1.5%',
            left: '41%',
            width: '6.8%',
            height: '8.2%',
          }}
        >
          {unitNumber}
        </button>

        {/* Кнопка Road Map */}
        <button
          onClick={onRoadmapClick}
          title="roadmap"
          className="absolute rounded border-2 border-indigo-500/0 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer group z-20"
          style={{
            top: '24.5%',
            left: '1.2%',
            width: '12.5%',
            height: '7.8%',
          }}
        >
          <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded shadow pointer-events-none transition-opacity">
            Открыть маршрут модулей ➔
          </span>
        </button>

        {/* Контент заданий и полей */}
        <div className="absolute inset-0 z-10">
          {children}
        </div>

        {/* 🚀 СТРЕЛКИ НАВИГАЦИИ (ВНИЗУ СПРАВА) */}
        <div
          className="absolute flex items-center justify-center gap-1 z-30"
          style={{
            top: '84.0%',
            left: '83.0%',
            width: '23.0%',
            height: '21.0%',
          }}
        >
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="p-1 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
            title="Предыдущая страница"
          >
            <img src="/arrow-left.png" alt="Назад" className="w-10 h-10 object-contain" />
          </button>

          <button
            onClick={onNext}
            disabled={isLast}
            className="p-1 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
            title="Следующая страница"
          >
            <img src="/arrow-right.png" alt="Вперед" className="w-10 h-10 object-contain" />
          </button>
        </div>
        {/* 📅 АКТУАЛЬНАЯ ДАТА — КНОПКА, ОТКРЫВАЕТ КАЛЕНДАРЬ */}
        <button
          onClick={onDateClick}
          title="Открыть календарь занятий"
          className="absolute flex items-center justify-center font-bold text-slate-800 text-base md:text-lg z-20 tracking-wider rounded-md transition-all duration-150 hover:bg-indigo-500/25 hover:scale-105 cursor-pointer focus:outline-none"
          style={{
            top: '1.5%',
            left: '60.5%',
            width: '14.8%',
            height: '8.2%',
          }}
        >
          {new Date().toLocaleDateString('ru-RU')}
        </button>

      </div>
    </div>
  );
}