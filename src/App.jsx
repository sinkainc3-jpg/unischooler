import React, { useState } from 'react';
import { unitsData } from './data/units';
import Alien from './components/Alien';
import Calendar from './components/Calendar';
import UnitEditor from './pages/admin/UnitEditor';
import UnitBank from './pages/admin/UnitBank';
import UniversalUnitFrame from './components/UniversalUnitFrame';

const PRAISE_PHRASES = ['Так держать!', 'Хорошая работа!', 'Правильно!'];
const ENCOURAGE_PHRASES = ['Попробуй еще!', 'У тебя получится!', 'Не расстраивайся!', 'Ты сможешь!'];

// Преобразует юнит из Supabase (elements, проценты) в формат плеера (fields/labels).
function unitFromDb(unit) {
  const elements = Array.isArray(unit.elements) ? unit.elements : [];
  return {
    ...unit,
    image: unit.image || unit.image_path || null,
    hint: unit.hint || '',
    labels: elements
      .filter((el) => el.type === 'text')
      .map((el) => ({
        id: el.id,
        text: el.content || '',
        top: `${el.y}%`,
        left: `${el.x}%`,
        fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
      })),
    fields: elements
      .filter((el) => el.type === 'input')
      .map((el) => ({
        id: el.id,
        top: `${el.y}%`,
        left: `${el.x}%`,
        width: `${el.width}%`,
        height: el.height ? `${el.height}%` : 'auto',
        correctAnswer: el.correctAnswer || '',
      })),
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('unit');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [openedUnit, setOpenedUnit] = useState(null);

  const activeUnits = openedUnit ? [openedUnit] : unitsData;
  const currentUnit = activeUnits?.[currentUnitIndex] || activeUnits?.[0] || {};
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
    if (activeUnits && currentUnitIndex < activeUnits.length - 1) {
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

  if (currentScreen === 'unitbank') {
    return (
      <UnitBank
        onBack={() => setCurrentScreen('unit')}
        onOpenUnit={(unit) => {
          setOpenedUnit(unitFromDb(unit));
          setCurrentUnitIndex(0);
          setUserAnswers({});
          setIsChecked(false);
          setPraise('');
          setCurrentScreen('unit');
        }}
      />
    );
  }

  // ОСНОВНОЙ ЭКРАН ЮНИТЫ
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen text-white p-6 bg-cover bg-center bg-no-repeat bg-fixed overflow-x-hidden"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-radial from-slate-950/30 via-slate-950/70 to-slate-950/95 pointer-events-none -z-0" />

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

      {/* Кнопки админки */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setCurrentScreen('unitbank')}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <span>📚</span> Банк юнитов
        </button>
        <button
          onClick={() => setCurrentScreen('adminEditor')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <span>✏️</span> Конструктор
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl">

        {/* РАМКА ЮНИТА — ЕДИНЫЙ КВАДРАТНЫЙ ШАБЛОН */}
        <UniversalUnitFrame
          unitNumber={currentUnitIndex + 1}
          score={score}
          subject={currentUnit.subject || 'Математика'}
          unitType={currentUnit.type || 'learn'}
          isAllCorrect={isAllCorrect}
          isChecked={isChecked}
          onPrev={handlePrev}
          onNext={handleNext}
          isFirst={currentUnitIndex === 0}
          isLast={!activeUnits || currentUnitIndex === activeUnits.length - 1}
          onRoadmapClick={() => setCurrentScreen('roadmap')}
          onLevelClick={() => setCurrentScreen('level')}
          onNumberClick={() => setCurrentScreen('unitlist')}
          onDateClick={() => setCurrentScreen('calendar')}
          onHelpClick={() => setIsHelpOpen((v) => !v)}
          onCheck={handleCheck}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCheck();
                      }
                    }}
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
        </UniversalUnitFrame>

        {isHelpOpen && (
        <Alien
          unitId={currentUnit.id}
          hint={currentUnit.hint}
          from="right"
          onClose={() => setIsHelpOpen(false)}
        />
      )}

      </div>
    </div>
  );
}