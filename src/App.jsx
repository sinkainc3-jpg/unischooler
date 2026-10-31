import React, { useState, useRef, useEffect } from 'react';
import { unitsData } from './data/units';
import Alien from './components/Alien';
import Calendar from './components/Calendar';
import UnitEditor from './pages/admin/UnitEditor';
import UnitBank from './pages/admin/UnitBank';
import UniversalUnitFrame from './components/UniversalUnitFrame';
import AutoFitFrame from './components/AutoFitFrame';

const PRAISE_PHRASES = ['Так держать!', 'Хорошая работа!', 'Правильно!'];
const ENCOURAGE_PHRASES = ['Попробуй еще!', 'У тебя получится!', 'Не расстраивайся!', 'Ты сможешь!'];

// Преобразует юнит из Supabase (elements, проценты) в формат плеера (fields/labels/choices/images).
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
        width: el.width != null ? `${el.width}%` : undefined,
        height: el.height != null ? `${el.height}%` : undefined,
        fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
        fontWeight: el.fontWeight || 'normal',
        textAlign: el.textAlign || 'left',
        textColor: el.textColor || '#1e293b',
      })),
    fields: elements
      .filter((el) => el.type === 'input')
      .map((el) => ({
        id: el.id,
        top: `${el.y}%`,
        left: `${el.x}%`,
        width: el.width != null ? `${el.width}%` : '20%',
        height: el.height != null ? `${el.height}%` : 'auto',
        correctAnswer: el.correctAnswer || '',
      })),
    choices: elements
      .filter((el) => el.type === 'choice')
      .map((el) => ({
        id: el.id,
        top: `${el.y}%`,
        left: `${el.x}%`,
        width: el.width != null ? `${el.width}%` : '40%',
        height: el.height != null ? `${el.height}%` : 'auto',
        options: el.options || [],
        correctOptionId: el.correctOptionId,
        fontSize: el.fontSize || 18,
        optionSize: el.optionSize || 18,
        optionGap: el.optionGap || 8,
        optionSpacing: el.optionSpacing || 8,
        optionTextColor: el.optionTextColor || '#1e293b',
      })),
    images: elements
      .filter((el) => el.type === 'image')
      .map((el) => {
        const toCss = (val, fallback) => {
          if (val == null) return fallback;
          if (typeof val === 'number') return `${val}px`;
          const s = String(val).trim();
          if (s.endsWith('px') || s.endsWith('%')) return s;
          return `${s}px`;
        };
        return {
          id: el.id,
          top: toCss(el.y, '60px'),
          left: toCss(el.x, '60px'),
          width: toCss(el.width, '240px'),
          height: toCss(el.height, '240px'),
          src: el.src || '',
        };
      }),
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('unit');
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [openedUnit, setOpenedUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);

  const activeUnits = openedUnit ? [openedUnit] : unitsData;
  const currentUnit = activeUnits?.[currentUnitIndex] || activeUnits?.[0] || {};
  const isTrain = currentUnit.type === 'train';
  const [userAnswers, setUserAnswers] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [praise, setPraise] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [score, setScore] = useState(0);

  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [currentScreen, currentUnitIndex, openedUnit]);

  const imageLayout = (() => {
    const { width: cw, height: ch } = containerSize;
    const { width: nw, height: nh } = imageNaturalSize;
    if (!currentUnit.image || nw <= 0 || nh <= 0 || cw <= 0 || ch <= 0) {
      return { x: 0, y: 0, width: '100%', height: '100%' };
    }
    const scale = Math.min(cw / nw, ch / nh);
    const displayWidth = nw * scale;
    const displayHeight = nh * scale;
    return {
      x: (cw - displayWidth) / 2,
      y: (ch - displayHeight) / 2,
      width: displayWidth,
      height: displayHeight,
    };
  })();

  const allCorrect = (
    ((currentUnit.fields?.length ?? 0) > 0 || (currentUnit.choices?.length ?? 0) > 0) &&
    (currentUnit.fields?.every((field) => {
      const answerKey = `${currentUnit.id}-${field.id}`;
      const userVal = (userAnswers[answerKey] || '').trim().toLowerCase();
      const correctVal = (field.correctAnswer || '').trim().toLowerCase();
      return userVal === correctVal;
    }) ?? true) &&
    (currentUnit.choices?.every((choice) => {
      const answerKey = `${currentUnit.id}-${choice.id}`;
      const userVal = userAnswers[answerKey];
      return userVal === choice.correctOptionId;
    }) ?? true)
  );

  const isAllCorrect = isChecked && allCorrect;

  const handleCheck = () => {
    const hasInputs = ((currentUnit.fields?.length ?? 0) > 0) || ((currentUnit.choices?.length ?? 0) > 0);
    if (isTrain && hasInputs && allCorrect) {
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
      setImageNaturalSize({ width: 0, height: 0 });
    }
  };

  const handleNext = () => {
    if (activeUnits && currentUnitIndex < activeUnits.length - 1) {
      setCurrentUnitIndex((prev) => prev + 1);
      setIsChecked(false);
      setImageNaturalSize({ width: 0, height: 0 });
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
      <UnitEditor
        key={editingUnit?.id || 'new'}
        initialUnit={editingUnit}
        onBack={() => {
          setEditingUnit(null);
          setCurrentScreen('unit');
        }}
      />
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
          setImageNaturalSize({ width: 0, height: 0 });
          setCurrentScreen('unit');
        }}
        onEditUnit={(unit) => {
          setEditingUnit(unit);
          setCurrentScreen('adminEditor');
        }}
      />
    );
  }

  // ОСНОВНОЙ ЭКРАН ЮНИТЫ
  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-hidden text-white bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-radial from-slate-950/30 via-slate-950/70 to-slate-950/95 pointer-events-none -z-0" />

      {isChecked && praise && (
        <div
          key={praise}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-[praise-pop_0.45s_ease-out_both]"
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

      {/* Верхняя навигационная панель с кнопками */}
      <header className="h-14 w-full shrink-0 flex items-center justify-between px-6 z-30">
        <div />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('unitbank')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
          >
            <span>📚</span> Банк юнитов
          </button>
          <button
            onClick={() => {
              setEditingUnit(null);
              setCurrentScreen('adminEditor');
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
          >
            <span>✏️</span> Конструктор
          </button>
        </div>
      </header>

      {/* Авто-вписывание бланка в экран без скролла (Fit to Screen) */}
      <AutoFitFrame className="flex-1 min-w-0">
        {/* РАМКА ЮНИТА — ЕДИНЫЙ КВАДРАТНЫЙ ШАБЛОН */}
        <UniversalUnitFrame
             unitNumber={currentUnitIndex + 1}
             unitId={currentUnit.id}
             moduleName={currentUnit.moduleName || currentUnit.module_name || 'Модуль'}
             unitCode={currentUnit.unitCode || currentUnit.unit_code}
          score={score}
          subject={currentUnit.subject || 'Математика'}
           stars={currentUnit.starsCount || currentUnit.difficulty || 3}
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
          <div
            ref={containerRef}
            className="relative w-full h-full min-h-0 bg-white overflow-hidden"
          >
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {currentUnit.image && (
                <img
                  src={currentUnit.image}
                  alt="Фон задания"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                    }
                  }}
                  draggable={false}
                  className="absolute inset-0 w-full h-full block select-none pointer-events-none"
                />
              )}

              {currentUnit.labels?.map((label) => (
                <div
                  key={label.id}
                  className="absolute select-none"
                  style={{
                    top: label.top,
                    left: label.left,
                    width: label.width || 'auto',
                    height: label.height || 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: label.textAlign === 'center' ? 'center' : label.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    overflow: 'hidden',
                    fontSize: label.fontSize || '18px',
                    fontWeight: label.fontWeight || 'normal',
                    textAlign: label.textAlign || 'left',
                    color: label.textColor || '#1e293b',
                    lineHeight: '1.2',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {label.text}
                </div>
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
                      height: field.height || 'auto',
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
                      className={`w-full h-full px-1.5 py-0 text-xs leading-none border rounded shadow-sm focus:outline-none transition-all ${statusStyle}`}
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

              {currentUnit.choices?.map((choice) => {
                const answerKey = `${currentUnit.id}-${choice.id}`;
                const userAnswer = userAnswers[answerKey];
                const showResult = isChecked && !!userAnswer;
                return (
                  <div
                    key={choice.id}
                    className="absolute"
                    style={{
                      top: choice.top,
                      left: choice.left,
                      width: choice.width,
                      height: choice.height,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${choice.optionSpacing || 8}px`,
                        padding: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {(choice.options || []).map((opt) => (
                        <label
                          key={opt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: `${choice.optionGap || 8}px`,
                            padding: '4px 8px',
                            background: '#fff',
                            border: '1px solid',
                            borderColor: showResult
                              ? (opt.id === choice.correctOptionId ? '#22c55e' : (opt.id === userAnswer ? '#ef4444' : '#cbd5e1'))
                              : '#cbd5e1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: `${choice.fontSize || 16}px`,
                            color: choice.optionTextColor || '#1e293b',
                          }}
                        >
                          <input
                            type="radio"
                            name={`choice-${choice.id}`}
                            value={opt.id}
                            checked={userAnswer === opt.id}
                            onChange={() => handleInputChange(choice.id, opt.id)}
                            style={{
                              width: `${choice.optionSize || 16}px`,
                              height: `${choice.optionSize || 16}px`,
                              accentColor: '#6366f1',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ flex: 1 }}>{opt.text}</span>
                          {showResult && opt.id === choice.correctOptionId && (
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                          )}
                          {showResult && opt.id === userAnswer && opt.id !== choice.correctOptionId && (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {currentUnit.images?.map((img) => (
                <div
                  key={img.id}
                  className="absolute"
                  style={{
                    top: img.top,
                    left: img.left,
                    width: img.width,
                    height: img.height,
                  }}
                >
                  {img.src && (
                    <img
                      src={img.src}
                      alt="Элемент"
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </UniversalUnitFrame>
      </AutoFitFrame>

      {isHelpOpen && (
        <Alien
          unitId={currentUnit.id}
          hint={currentUnit.hint}
          from="right"
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </div>
  );
}
