import React, { useState, useEffect } from 'react';
import { unitsData } from './data/units';
import UnitFrame from './components/UnitFrame';
import TrUnitFrame from './components/TrUnitFrame';
import Alien from './components/Alien';
import Calendar from './components/Calendar';
import UnitEditor from './pages/admin/UnitEditor';

const PRAISE_PHRASES = ['Так держать!', 'Хорошая работа!', 'Правильно!'];
const ENCOURAGE_PHRASES = ['Попробуй еще!', 'У тебя получится!', 'Не расстраивайся!', 'Ты сможешь!'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('unit');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setCurrentScreen('adminEditor');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUnit = unitsData?.[currentUnitIndex] || unitsData?.[0] || {};
  const isTrain = currentUnit.type === 'train';
  const [userAnswers, setUserAnswers] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [praise, setPraise] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [score, setScore] = useState(0);

  const allCorrect = currentUnit.fields?.every((field) => {
    const answerKey = `${currentUnit.id}-${field.id}`;
    const userVal = (userAnswers[answerKey] || '').trim().toLowerCase();
    const correctVal = (field.correctAnswer || '').trim().toLowerCase();
    return userVal === correctVal;
  }) ?? false;

  const isAllCorrect = isChecked && allCorrect;

  const handleCheck = () => {
    const hasFields = (currentUnit.fields?.length ?? 0) > 0;
    if (isTrain && hasFields && allCorrect) {
      setScore((s) => s + 10);
    }
    const list = allCorrect ? PRAISE_PHRASES : ENCOURAGE_PHRASES;
    const options = list.filter((phrase) => phrase !== praise);
    setPraise(options[Math.floor(Math.random() * options.length)]);
    setIsChecked(true);
  };

  const handleInputChange = (id, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [`${currentUnit.id}-${id}`]: value
    }));
    setIsChecked(false);
  };

  const handlePrev = () => {
    if (currentUnitIndex > 0) {
      setCurrentUnitIndex((prev) => prev - 1);
      setIsChecked(false);
    }
  };

  const handleNext = () => {
    if (unitsData && currentUnitIndex < unitsData.length - 1) {
      setCurrentUnitIndex((prev) => prev + 1);
      setIsChecked(false);
    }
  };

  // ЭКРАН КАЛЕНДАРЯ
  if (currentScreen === 'calendar') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Календарь занятий</h1>
        <Calendar completedDays={[]} />
        <button
          onClick={() => setCurrentScreen('unit')}
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          ← Вернуться к уроку
        </button>
      </div>
    );
  }

  // ЭКРАН ROAD MAP
  if (currentScreen === 'roadmap') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <p className="text-lg md:text-xl text-slate-300 mb-8">Здесь будет маршрут модулей, i guess</p>
        <button
          onClick={() => setCurrentScreen('unit')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          ← Вернуться к уроку
        </button>
      </div>
    );
  }

  if (currentScreen === 'unitlist') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Список юнит</h1>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full max-w-lg mb-8 shadow-xl">
          {unitsData?.map((unit, index) => (
            <button
              key={unit.id || index}
              onClick={() => {
                setCurrentUnitIndex(index);
                setCurrentScreen('unit');
              }}
              className={`w-full text-left px-4 py-3 mb-2 last:mb-0 rounded-lg border flex items-center gap-3 transition-all duration-150 cursor-pointer ${
                index === currentUnitIndex
                  ? 'border-indigo-500 bg-indigo-500/10 font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.25)]'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-indigo-500/40 text-slate-300'
              }`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 shrink-0 rounded-md text-sm font-bold ${
                  index === currentUnitIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {index + 1}
              </span>
              {unit.title || `Юнита ${index + 1}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentScreen('unit')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          ← Вернуться к уроку
        </button>
      </div>
    );
  }

  if (currentScreen === 'level') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <p className="text-lg md:text-xl text-slate-300 mb-8">Здесь будут все модули Nго уровня</p>
        <button
          onClick={() => setCurrentScreen('unit')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          ← Вернуться к уроку
        </button>
      </div>
    );
  }

  if (currentScreen === 'adminEditor') {
    return (
      <UnitEditor onBack={() => setCurrentScreen('unit')} />
    );
  }

  // ОСНОВНОЙ ЭКРАН ЮНИТЫ
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen text-white p-6 bg-cover bg-center bg-no-repeat bg-fixed overflow-x-hidden"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-radial from-slate-950/30 via-slate-950/70 to-slate-950/95 pointer-events-none -z-0" />

      {!isTrain && (
        <button
          onClick={() => setCurrentScreen('level')}
          title="Выбор уровня"
          className="absolute z-20 flex items-center justify-center w-6 h-6 bg-slate-900/80 border border-slate-700 rounded-full text-indigo-300 font-bold text-base hover:bg-indigo-600 hover:text-white transition-all duration-150 cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.2)] -translate-y-1/2"
          style={{
            top: '44%',
            left: '31%',
          }}
        >
          <span className="block -rotate-90">n</span>
        </button>
      )}

      {isChecked && praise && (
        <div
          key={praise}
          className="absolute top-6 left-1/2 z-20 pointer-events-none animate-[praise-pop_0.45s_ease-out_both]"
        >
          <span
            className={`px-6 py-2 rounded-full border font-bold text-lg md:text-xl tracking-wide backdrop-blur-sm whitespace-nowrap ${
              isAllCorrect
                ? 'bg-green-500/15 border-green-400/60 text-green-300 shadow-[0_0_25px_rgba(74,222,128,0.35)]'
                : 'bg-red-500/15 border-red-400/60 text-red-300 shadow-[0_0_25px_rgba(248,113,113,0.35)]'
            }`}
          >
            {praise}
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl">

        {/* РАМКА ЮНИТА — УЧЕБНАЯ ИЛИ ТРЕНИРОВОЧНАЯ */}
        {isTrain ? (
          <TrUnitFrame
            unitNumber={currentUnitIndex + 1}
            score={score}
            isAllCorrect={isAllCorrect}
            isChecked={isChecked}
            onPrev={handlePrev}
            onNext={handleNext}
            isFirst={currentUnitIndex === 0}
            isLast={!unitsData || currentUnitIndex === unitsData.length - 1}
            onLevelClick={() => setCurrentScreen('level')}
            onNumberClick={() => setCurrentScreen('unitlist')}
            onDateClick={() => setCurrentScreen('calendar')}
          >
            <div className="relative w-full h-full">
              {currentUnit.fields?.map((field) => {
                const answerKey = `${currentUnit.id}-${field.id}`;
                const userVal = userAnswers[answerKey] || '';
                const isCorrect = userVal.trim().toLowerCase() === field.correctAnswer?.trim().toLowerCase();

                let statusStyle = 'border-indigo-500/60 bg-white/90 text-slate-900 focus:border-indigo-600';
                if (isChecked) {
                  statusStyle = isCorrect
                    ? 'border-green-600 bg-green-100 text-green-950 font-bold'
                    : 'border-red-600 bg-red-100 text-red-950 font-bold';
                }

                return (
                  <div
                    key={field.id}
                    className="absolute flex items-center"
                    style={{
                      top: field.top,
                      left: field.left,
                      width: field.width,
                      height: field.height || 'auto'
                    }}
                  >
                    <input
                      type="text"
                      value={userVal}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder="..."
                      className={`w-full px-1.5 py-0 text-xs leading-none border rounded shadow-sm focus:outline-none transition-all ${statusStyle}`}
                    />

                    {isChecked && (
                      <span className="absolute -right-7 flex items-center justify-center font-extrabold text-lg drop-shadow">
                        {isCorrect ? (
                          <span className="text-green-500 animate-bounce">✓</span>
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </TrUnitFrame>
        ) : (
          <UnitFrame
          unitNumber={currentUnitIndex + 1}
          onPrev={handlePrev}
          onNext={handleNext}
          isFirst={currentUnitIndex === 0}
          isLast={!unitsData || currentUnitIndex === unitsData.length - 1}
          onRoadmapClick={() => setCurrentScreen('roadmap')}
          onNumberClick={() => setCurrentScreen('unitlist')}
          onDateClick={() => setCurrentScreen('calendar')}
          onHelpClick={() => setIsHelpOpen((v) => !v)}
          isAllCorrect={isAllCorrect}
        >
          <div className="relative w-full h-full">
            {currentUnit.image && (
              <img
                src={currentUnit.image}
                alt={currentUnit.title || 'Картинка задания'}
                className="w-full h-auto block select-none"
              />
            )}

            {currentUnit.labels?.map((label) => (
              <span
                key={label.id}
                className="absolute font-bold text-slate-900 select-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: label.top,
                  left: label.left,
                  fontSize: label.fontSize || '16px',
                }}
              >
                {label.text}
              </span>
            ))}

            {currentUnit.fields?.map((field) => {
              const answerKey = `${currentUnit.id}-${field.id}`;
              const userVal = userAnswers[answerKey] || '';
              const isCorrect = userVal.trim().toLowerCase() === field.correctAnswer?.trim().toLowerCase();

              let statusStyle = 'border-indigo-500/60 bg-white/90 text-slate-900 focus:border-indigo-600';
              if (isChecked) {
                statusStyle = isCorrect
                  ? 'border-green-600 bg-green-100 text-green-950 font-bold'
                  : 'border-red-600 bg-red-100 text-red-950 font-bold';
              }

              return (
                <div
                  key={field.id}
                  className="absolute flex items-center"
                  style={{
                    top: field.top,
                    left: field.left,
                    width: field.width,
                    height: field.height || 'auto'
                  }}
                >
                  <input
                    type="text"
                    value={userVal}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder="..."
                    className={`w-full px-1.5 py-0 text-xs leading-none border rounded shadow-sm focus:outline-none transition-all ${statusStyle}`}
                  />

                  {isChecked && (
                    <span className="absolute -right-7 flex items-center justify-center font-extrabold text-lg drop-shadow">
                      {isCorrect ? (
                        <span className="text-green-500 animate-bounce">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </UnitFrame>
        )}

        {isHelpOpen && (
        <Alien
          unitId={currentUnit.id}
          hint={currentUnit.hint}
          from="right"
          onClose={() => setIsHelpOpen(false)}
        />
      )}

      {/* КНОПКА ПРОВЕРКИ */}
        <button
          onClick={handleCheck}
          className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition active:scale-95 cursor-pointer"
        >
          Проверить ответы
        </button>

      </div>
    </div>
  );
}