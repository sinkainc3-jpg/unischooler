import React from 'react';
import happyManUrl from '../../sprites/happyMan.jpg';
import sadManUrl from '../../sprites/sadMan.jpeg';

export default function TrUnitFrame({
  unitNumber = 1,
  score = 0,
  isAllCorrect,
  isChecked,
  onPrev,
  onNext,
  isFirst,
  isLast,
  onLevelClick,
  onNumberClick,
  onDateClick,
  children,
}) {
  return (
    <div className="relative w-full max-w-3xl mx-auto select-none my-4">
      {/* Неоновое свечение */}
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/30 via-fuchsia-500/20 to-purple-500/30 rounded-3xl blur-2xl -z-10" />

      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-slate-700/50">
        <img
          src="/tr_frame.png"
          alt="Рамка тренировочного юнита"
          className="w-full h-auto block select-none"
        />

        {/* 🤖 ТАБЛИЧКА РОБОТА — ВЫБОР УРОВНЯ */}
        <button
          onClick={onLevelClick}
          title="Выбор уровня"
          className="absolute rounded-lg border-2 border-pink-500/0 hover:border-pink-400 hover:bg-pink-500/15 transition-all cursor-pointer group z-20"
          style={{
            top: '8%',
            left: '6%',
            width: '16.1%',
            height: '11.6%',
          }}
        >
          <span className="opacity-0 group-hover:opacity-100 absolute top-1/2 left-full ml-2 -translate-y-1/2 w-max max-w-[160px] bg-pink-600 text-[10px] text-white px-2 py-1 rounded shadow pointer-events-none transition-opacity">
            Выбрать уровень
          </span>
        </button>

        {/* 🔢 НОМЕР ЮНИТА */}
        <button
          onClick={onNumberClick}
          title="Список юнитов"
          className="absolute flex items-center justify-center font-bold text-slate-800 text-base md:text-lg z-20 rounded-md transition-all duration-150 hover:bg-pink-500/25 hover:scale-110 cursor-pointer focus:outline-none"
          style={{
            top: '17.2%',
            left: '37.5%',
            width: '6.6%',
            height: '3.9%',
          }}
        >
          {unitNumber}
        </button>

        {/* 📅 ДАТА — ОТКРЫВАЕТ КАЛЕНДАРЬ */}
        <button
          onClick={onDateClick}
          title="Календарь занятий"
          className="absolute flex items-center justify-center font-bold text-slate-800 text-sm md:text-base z-20 rounded-md transition-all duration-150 hover:bg-pink-500/25 hover:scale-105 cursor-pointer focus:outline-none"
          style={{
            top: '17.2%',
            left: '57.8%',
            width: '17.3%',
            height: '3.9%',
          }}
        >
          {new Date().toLocaleDateString('ru-RU')}
        </button>

        {/* 🏆 БАЛЛЫ */}
        <div
          key={score}
          className="absolute flex items-center justify-center font-extrabold text-indigo-700 text-xl md:text-2xl z-20 pointer-events-none animate-[score-pop_0.5s_ease-out_both]"
          style={{
            top: '15.6%',
            left: '80.4%',
            width: '15.1%',
            height: '7.6%',
          }}
        >
          {score}
        </div>

        {/* ✅ КРУЖОК СМАЙЛИКА */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: '91%',
            left: '85%',
            width: '12%',
          }}
        >
          <div
            className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all duration-500 ${
              isAllCorrect
                ? 'border-green-400 bg-green-100 shadow-[0_0_18px_rgba(74,222,128,0.8)] scale-70'
                : isChecked
                  ? 'border-red-400 bg-red-100 shadow-[0_0_18px_rgba(248,113,113,0.8)] scale-70'
                  : 'border-transparent bg-transparent'
            }`}
          >
            <img
              src={isAllCorrect ? happyManUrl : sadManUrl}
              alt={isAllCorrect ? 'Успех' : 'Попробуй еще'}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isChecked ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'
              }`}
            />
          </div>
        </div>

        {/* КОНТЕНТ ЗАДАНИЯ */}
        <div
          className="absolute z-10"
          style={{
            top: '24%',
            left: '3%',
            width: '94%',
            height: '61%',
          }}
        >
          {children}
        </div>

        {/* 🚀 СТРЕЛКИ НАВИГАЦИИ (ВНИЗУ СЛЕВА) */}
        <div
          className="absolute flex items-center justify-center gap-2 z-30"
          style={{
            top: '89%',
            left: '3%',
          }}
        >
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="p-1 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
            title="Предыдущая страница"
          >
            <img src="/arrow-left.png" alt="Назад" className="w-14 h-14 object-contain" />
          </button>

          <button
            onClick={onNext}
            disabled={isLast}
            className="p-1 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
            title="Следующая страница"
          >
            <img src="/arrow-right.png" alt="Вперед" className="w-14 h-14 object-contain" />
          </button>
        </div>
      </div>
    </div>
  );
}
