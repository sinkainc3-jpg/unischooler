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
    <div className="relative flex max-h-full w-full max-w-2xl items-center justify-center select-none text-slate-900">
      {/* Основной контейнер-каркас: белый лист бумаги */}
      <div className="relative flex aspect-[1/1.1] max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border-2 border-slate-800 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.75)]">

        {/* ================= ШАПКА ================= */}
        <div className="shrink-0 bg-white border-b-2 border-dashed border-slate-400 px-3 py-2 flex items-center justify-between gap-2">

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
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                />
                <span className="pointer-events-none absolute left-0 translate-x-0 top-full mt-2 z-50 w-max max-w-[170px] rounded bg-pink-600 px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  Выбрать уровень
                </span>
              </button>
            )}

            <span className="shrink-0 truncate rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-900">
              {subjectLabel.toUpperCase()}
            </span>

            {!isTrain && (
              <button
                onClick={onRoadmapClick}
                className="flex shrink-0 flex-col items-center justify-center rounded-lg border-2 border-slate-700 bg-white px-2.5 py-1 leading-tight text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Открыть маршрут модулей"
              >
                <span className="text-xs font-bold">{moduleName || 'Модуль'}</span>
                <span className="text-[10px] font-mono font-medium tracking-wide text-slate-500 whitespace-nowrap">
                  {displayedUnitCode}
                </span>
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
              <div className="flex items-center gap-1 rounded-xl border-2 border-slate-700 bg-white px-2.5 py-1.5 shadow-sm" title={`Сложность: ${starsToShow} из 3`}>
                {Array.from({ length: starsToShow }).map((_, index) => (
                  <svg
                    key={index}
                    viewBox="0 0 24 24"
                    aria-label="Звёздочка"
                    role="img"
                    className="h-6 w-6 fill-amber-400 stroke-amber-900 stroke-[1.8] drop-shadow-sm"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
                  </svg>
                ))}
                <button
                  onClick={onHelpClick}
                  className="relative shrink-0 group cursor-pointer hover:scale-105 transition-transform"
                  title="Нажми, чтобы вызвать помощь"
                >
                  <img src={alienUrl} alt="Помощь" className="h-16 w-20 object-contain" />
                  <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-max max-w-[170px] rounded bg-indigo-600 px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                    Нажми, чтобы вызвать помощь
                  </span>
                </button>
              </div>
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
