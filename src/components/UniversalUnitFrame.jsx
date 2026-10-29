import React from 'react';
import happyManUrl from '/sprites/happyMan.jpg';
import sadManUrl from '/sprites/sadMan.jpeg';

export default function UniversalUnitFrame({
  unitNumber = 1,
  score = 0,
  unitType = 'learn', // 'learn' или 'train'
  isAllCorrect = false,
  isChecked = false,
  onPrev,
  onNext,
  isFirst,
  isLast,
  onRoadmapClick,
  onNumberClick,
  onDateClick,
  onHelpClick,
  onLevelClick,
  onCheck,
  children
}) {
  const isTrain = unitType === 'train';

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none my-4 text-slate-900">
      {/* Основной контейнер-каркас: белый лист бумаги */}
      <div className="relative bg-white border-2 border-slate-800 rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.75)] flex flex-col aspect-[1/1.1]">

        {/* ================= ШАПКА ================= */}
        <div className="shrink-0 bg-white border-b-2 border-dashed border-slate-400 px-3 py-2 flex items-center justify-between gap-2">

          {/* Левый блок: НЛО + «Модуль» (учебный) / Робот (тренировочный) */}
          <div className="flex items-center gap-2 min-w-0">
            {!isTrain ? (
              <button
                onClick={onHelpClick}
                className="relative shrink-0 group cursor-pointer"
                title="Нажми, чтобы вызвать помощь"
              >
                <img
                  src="/sprites/ufo.png"
                  alt="Помощь"
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                />
                <span className="pointer-events-none absolute left-0 translate-x-0 top-full mt-2 z-50 w-max max-w-[170px] rounded bg-indigo-600 px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  Нажми, чтобы вызвать помощь
                </span>
              </button>
            ) : (
              <button
                onClick={onLevelClick}
                className="relative shrink-0 group cursor-pointer"
                title="Выбор уровня"
              >
                <img
                  src="/sprites/robot.png"
                  alt="Выбор уровня"
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                />
                <span className="pointer-events-none absolute left-0 translate-x-0 top-full mt-2 z-50 w-max max-w-[170px] rounded bg-pink-600 px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  Выбрать уровень
                </span>
              </button>
            )}

            {!isTrain && (
              <button
                onClick={onRoadmapClick}
                className="shrink-0 rounded-lg border-2 border-slate-700 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Открыть маршрут модулей"
              >
                Модуль
              </button>
            )}
          </div>

          {/* Центр: Юнит + дата */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-indigo-950">Юнит</span>
              <button
                onClick={onNumberClick}
                className="rounded-lg border-2 border-slate-600 bg-white px-3 py-0.5 font-bold text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Список юнитов"
              >
                {unitNumber}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-indigo-950">дата</span>
              <button
                onClick={onDateClick}
                className="rounded-lg border-2 border-slate-600 bg-white px-3 py-0.5 font-bold text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Открыть календарь занятий"
              >
                {new Date().toLocaleDateString('ru-RU')}
              </button>
            </div>
          </div>

          {/* Правый блок: логотип + баллы */}
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <img
              src="/sprites/logo.png"
              alt="Unischooler"
              className="w-16 h-16 object-contain"
            />
            {isTrain && (
              <div className="whitespace-nowrap rounded-lg border-2 border-slate-600 bg-white px-2 py-0.5 text-xs font-bold text-slate-900">
                Баллы: {score}
              </div>
            )}
          </div>
        </div>

        {/* ================= ЦЕНТРАЛЬНАЯ ОБЛАСТЬ (ХОЛСТ) ================= */}
        <div className="relative flex-1 bg-white overflow-hidden">
          {children}
        </div>

        {/* ================= ПОДВАЛ ================= */}
        <div className="shrink-0 bg-white border-t-2 border-dashed border-slate-300 px-4 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* Слева: звёздочки (учебный) или статус */}
          <div className="flex items-center gap-2 justify-self-start">
            {!isTrain ? (
              <img
                src="/sprites/stars.png"
                alt="Звёздочки"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Тренировка
              </span>
            )}
          </div>

          {/* Центр: проверка ответов */}
          <div className="justify-self-center">
            <button
              onClick={onCheck}
              disabled={!onCheck}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              Проверить ответы
            </button>
          </div>

          {/* Справа: смайлик + навигация */}
          <div className="flex items-end gap-3 justify-self-end">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-12 h-12 rounded-full border-2 border-slate-600 overflow-hidden flex items-center justify-center bg-white">
                {isAllCorrect ? (
                  <img src={happyManUrl} alt="Успех" className="w-full h-full object-cover" />
                ) : isChecked ? (
                  <img src={sadManUrl} alt="Попробуй еще" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <span className="text-[10px] font-bold text-slate-700">У меня получилось!</span>
            </div>

            <div className="flex items-center gap-1 rounded-lg border-2 border-slate-700 bg-white p-1">
              <button
                onClick={onPrev}
                disabled={isFirst}
                className="p-0.5 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-25 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                title="Предыдущая страница"
              >
                <img src="/sprites/arrow-left.png" alt="Назад" className="w-9 h-9 object-contain" />
              </button>
              <button
                onClick={onNext}
                disabled={isLast}
                className="p-0.5 transition-all duration-150 hover:scale-110 active:scale-90 disabled:opacity-25 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                title="Следующая страница"
              >
                <img src="/sprites/arrow-right.png" alt="Вперед" className="w-9 h-9 object-contain" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
