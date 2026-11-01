import React from 'react';
import happyManUrl from '/sprites/happyMan.jpg';
import sadManUrl from '/sprites/sadMan.jpeg';
import alienUrl from '../../sprites/alien.png';

const SUBJECT_LABELS = {
  math: 'Математика',
  russian: 'Русский язык',
  history: 'История',
};

const getSubjectLabel = (subject) => {
  if (!subject) return SUBJECT_LABELS.math;
  return SUBJECT_LABELS[subject] || subject;
};

export default function UniversalUnitFrame({
  unitNumber = 1,
  unitId = '',
  moduleName = 'Модуль',
  unitCode,
  score = 0,
  subject = 'math',
  stars = 3,
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
  const subjectLabel = getSubjectLabel(subject);
  const starsToShow = Math.min(3, Math.max(1, Number(stars) || 3));
  const displayedUnitCode = unitCode || unitId || '0000-0000-0000';

  return (
    <div className="relative flex w-full h-full shrink-0 items-center justify-center select-none text-zinc-900">
      {/* Основной контейнер-каркас: белый лист бумаги со строгой фиксированной геометрией */}
      <div className="relative flex w-full h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-900/90 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.1)]">

        {/* ================= ШАПКА ================= */}
        <div className="shrink-0 bg-white border-b border-dashed border-zinc-400 h-[72px] px-4 flex items-center justify-between gap-2">

          {/* Левый блок: название предмета и модуль / робот */}
          <div className="flex items-center gap-2 min-w-0">
            {isTrain && (
              <button
                onClick={onLevelClick}
                className="relative shrink-0 group cursor-pointer"
                title="Выбор уровня"
              >
                <img
                  src="/sprites/robot.png"
                  alt="Выбор уровня"
                  className="w-12 h-12 object-contain transition-transform group-hover:scale-105"
                />
                <span className="pointer-events-none absolute left-0 translate-x-0 top-full mt-2 z-50 w-max max-w-[170px] rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[10px] font-medium text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Выбрать уровень
                </span>
              </button>
            )}

            <span className="shrink-0 truncate rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-800">
              {subjectLabel.toUpperCase()}
            </span>

            {!isTrain && (
              <button
                onClick={onRoadmapClick}
                className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-zinc-300 bg-white px-2.5 py-1 leading-tight text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 transition cursor-pointer shadow-sm"
                title="Открыть маршрут модулей"
              >
                <span className="text-xs font-bold">{moduleName || 'Модуль'}</span>
                <span className="text-[10px] font-mono font-medium tracking-wide text-zinc-500 whitespace-nowrap">
                  {displayedUnitCode}
                </span>
              </button>
            )}
          </div>

          {/* Центр: Юнит + дата */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500">Юнит</span>
              <button
                onClick={onNumberClick}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 transition cursor-pointer shadow-sm"
                title="Список юнитов"
              >
                {unitNumber}
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500">дата</span>
              <button
                onClick={onDateClick}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 transition cursor-pointer shadow-sm"
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
              className="w-12 h-12 object-contain"
            />
            {isTrain && (
              <div className="whitespace-nowrap rounded-md border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-800 shadow-sm">
                Баллы: {score}
              </div>
            )}
          </div>
        </div>

        {/* ================= ЦЕНТРАЛЬНАЯ ОБЛАСТЬ (ХОЛСТ) ================= */}
        <div className="relative w-full h-[492px] min-h-[492px] max-h-[492px] bg-white overflow-hidden shrink-0">
          {children}
        </div>

        {/* ================= ПОДВАЛ ================= */}
        <div className="shrink-0 bg-white border-t border-dashed border-zinc-400 h-[96px] px-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-auto">

          {/* Слева: звёздочки (учебный) или статус */}
          <div className="flex items-center gap-2 justify-self-start">
            {!isTrain ? (
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-zinc-50/90 px-3.5 py-2 shadow-sm" title={`Сложность: ${starsToShow} из 3`}>
                {Array.from({ length: starsToShow }).map((_, index) => (
                  <svg
                    key={index}
                    viewBox="0 0 24 24"
                    aria-label="Звёздочка"
                    role="img"
                    className="h-7 w-7 fill-amber-400 stroke-amber-800/80 stroke-[1.5] drop-shadow-sm"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
                  </svg>
                ))}
                <button
                  onClick={onHelpClick}
                  className="relative shrink-0 group cursor-pointer hover:scale-105 active:scale-95 transition-transform ml-1.5"
                  title="Нажми, чтобы вызвать помощь"
                >
                  <img src={alienUrl} alt="Помощь" className="h-12 w-16 object-contain drop-shadow-sm" />
                  <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-max max-w-[170px] rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Нажми, чтобы вызвать помощь
                  </span>
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Тренировка
              </span>
            )}
          </div>

          {/* Центр: проверка ответов */}
          <div className="justify-self-center">
            <button
              onClick={onCheck}
              disabled={!onCheck}
              className="px-7 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl shadow-sm border border-zinc-700/60 transition active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
            >
              Проверить ответы
            </button>
          </div>

          {/* Справа: смайлик + навигация */}
          <div className="flex items-center gap-2.5 justify-self-end">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 shadow-inner ${
                  isAllCorrect
                    ? 'border-2 border-emerald-400 bg-emerald-50 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
                    : isChecked
                    ? 'border-2 border-rose-400 bg-rose-50 shadow-[0_0_16px_rgba(251,113,133,0.45)]'
                    : 'border border-zinc-300/80 bg-zinc-100/60'
                }`}
              >
                {isAllCorrect ? (
                  <img
                    key="happy"
                    src={happyManUrl}
                    alt="Успех"
                    className="w-full h-full object-cover animate-[smiley-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                  />
                ) : isChecked ? (
                  <img
                    key="sad"
                    src={sadManUrl}
                    alt="Попробуй еще"
                    className="w-full h-full object-cover animate-[smiley-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
                  />
                ) : null}
              </div>
              <span className="text-[11px] font-medium text-zinc-600 whitespace-nowrap">У меня получилось!</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-300 bg-white p-1.5 shadow-sm">
              <button
                onClick={onPrev}
                disabled={isFirst}
                className="p-1 transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                title="Предыдущая страница"
              >
                <img src="/sprites/arrow-left.png" alt="Назад" className="w-9 h-9 object-contain" />
              </button>
              <button
                onClick={onNext}
                disabled={isLast}
                className="p-1 transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
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
