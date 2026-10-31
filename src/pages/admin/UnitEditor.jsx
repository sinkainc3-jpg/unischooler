import React, { useState, useRef, useCallback } from 'react';
import UnitCanvas from '../../components/editor/UnitCanvas';
import EditorSidebar from '../../components/editor/EditorSidebar';
import UniversalUnitFrame from '../../components/UniversalUnitFrame';
import { supabase } from '../../lib/supabase';

const SUBJECT_LABELS = {
  math: 'Математика',
  russian: 'Русский язык',
  history: 'История',
};

const getSubjectLabel = (subject) => {
  if (!subject) return SUBJECT_LABELS.math;
  return SUBJECT_LABELS[subject] || subject;
};

const DEFAULT_UNIT = {
  id: '',
  subject: 'math',
  type: 'learn',
  difficulty: 3,
  starsCount: 3,
  moduleName: 'Модуль',
  unitCode: '',
  title: '',
  image: '',
  imagePath: '',
  hint: '',
  elements: [],
};

// Контейнер с масштабированием для рамки. Объявлен на уровне модуля намеренно:
// если объявлять его внутри рендера UnitEditor, при каждом обновлении состояния
// создаётся новый тип компонента и React перемонтирует всё поддерево —
// тогда сбрасываются значения и фокус полей ввода в предпросмотре.
const ScaledFrame = ({ unitType, children }) => (
  <div className={`w-full h-auto min-w-fit flex-shrink-0 ${unitType === 'learn' ? 'mx-auto' : ''}`}>
    {children}
  </div>
);

export default function UnitEditor({ onBack }) {
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageDimensions, _setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [exportJson, setExportJson] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const generateId = useCallback(() => `unit-${Date.now()}`, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }
    const url = URL.createObjectURL(file);
    console.log('IMAGE URL SET:', url);
    setImageUrl(url);
    setUnit((prev) => ({ ...prev, image: url, imagePath: file.name }));
  };

  const addElement = (type) => {
    let newElement;
    const existingCount = unit.elements.filter((el) => el.type === type).length;
    
    if (type === 'text') {
      newElement = {
        id: `text-${existingCount + 1}`,
        type: 'text',
        x: 10,
        y: 10 + existingCount * 8,
        width: 40,
        height: 8,
        content: 'Текст',
        fontSize: 18,
        fontWeight: 'normal',
        textAlign: 'left',
        textColor: '#1e293b',
      };
    } else if (type === 'input') {
      newElement = {
        id: `input-${existingCount + 1}`,
        type: 'input',
        x: 10,
        y: 10 + existingCount * 8,
        width: 20,
        height: 6,
        correctAnswer: '',
      };
    } else if (type === 'choice') {
      newElement = {
        id: `choice-${existingCount + 1}`,
        type: 'choice',
        x: 10,
        y: 10 + existingCount * 8,
        width: 40,
        height: 20,
        options: [
          { id: 'option-1', text: 'Вариант 1' },
          { id: 'option-2', text: 'Вариант 2' },
        ],
        correctOptionId: 'option-1',
        fontSize: 18,
        optionSize: 18,
        optionGap: 8,
        optionSpacing: 8,
        optionTextColor: '#1e293b',
      };
    } else if (type === 'image') {
      newElement = {
        id: `image-${existingCount + 1}`,
        type: 'image',
        x: 20,
        y: 20,
        width: 30,
        height: 25,
        src: '',
      };
    }
    
    setUnit((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
  };

  const updateElement = (elementId, updates) => {
    setUnit((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
  };

  const deleteElement = (elementId) => {
    setUnit((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }));
    setSelectedElementId(null);
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[elementId];
      return next;
    });
  };

  const duplicateElement = (elementId) => {
    setUnit((prev) => {
      const element = prev.elements.find((el) => el.id === elementId);
      if (!element) return prev;
      let baseId;
      if (element.type === 'text') baseId = 'text';
      else if (element.type === 'input') baseId = 'input';
      else if (element.type === 'choice') baseId = 'choice';
      else baseId = 'answer';
      
      const existingCount = prev.elements.filter((el) => el.type === element.type).length;
      const newElement = {
        ...element,
        id: `${baseId}-${existingCount + 1}`,
        x: element.x + 2,
        y: element.y + 2,
      };
      return { ...prev, elements: [...prev.elements, newElement] };
    });
  };

  const handleUserAnswer = (elementId, value) => {
    setUserAnswers((prev) => ({ ...prev, [elementId]: value }));
    if (checked) setChecked(false);
  };

  const checkAnswers = () => {
    setChecked(true);
  };

  const handleExport = () => {
    const exportUnit = {
      id: unit.id || generateId(),
      subject: unit.subject || 'math',
      difficulty: unit.difficulty || 3,
      starsCount: unit.starsCount || unit.difficulty || 3,
      moduleName: unit.moduleName || 'Модуль',
      unitCode: unit.unitCode || unit.id || '0000-0000-0000',
      title: unit.title,
      image: unit.imagePath || unit.image,
      hint: unit.hint,
      elements: unit.elements.map((el) => {
        const base = {
          id: el.id,
          type: el.type,
          x: Number(el.x.toFixed(1)),
          y: Number(el.y.toFixed(1)),
          width: Number(el.width.toFixed(1)),
          height: Number(el.height.toFixed(1)),
        };
        if (el.type === 'input') {
          return { ...base, correctAnswer: el.correctAnswer };
        }
        if (el.type === 'text') {
          return {
            ...base,
            content: el.content,
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            textAlign: el.textAlign,
            textColor: el.textColor,
          };
        }
        if (el.type === 'choice') {
          return {
            ...base,
            options: el.options,
            correctOptionId: el.correctOptionId,
            fontSize: el.fontSize,
            optionSize: el.optionSize,
            optionGap: el.optionGap,
            optionSpacing: el.optionSpacing,
            optionTextColor: el.optionTextColor,
          };
        }
        if (el.type === 'image') {
          return { ...base, src: el.src };
        }
        return base;
      }),
    };
    
    // Добавляем type только для математики
    if (unit.subject === 'math') {
      exportUnit.type = unit.type || 'learn';
    }
    
    const json = JSON.stringify(exportUnit, null, 2);
    setExportJson(json);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportUnit.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    if (exportJson) {
      navigator.clipboard.writeText(exportJson);
      alert('JSON скопирован в буфер обмена!');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        let elements = [];
        if (imported.elements) {
          elements = imported.elements;
        } else if (imported.fields) {
          elements = imported.fields.map((f) => ({
            ...f,
            type: 'input',
            content: '',
            fontSize: 18,
            fontWeight: 'normal',
            textAlign: 'left',
          }));
        }
        
        const subject = imported.subject || 'math';
        const isRussian = subject === 'russian';
        
        setUnit({
          id: imported.id || '',
          subject: subject,
          difficulty: imported.difficulty || 3,
          starsCount: imported.starsCount || imported.difficulty || 3,
          moduleName: imported.moduleName || imported.module_name || 'Модуль',
          unitCode: imported.unitCode || imported.unit_code || '',
          type: isRussian ? undefined : (imported.type || 'learn'),
          title: imported.title || '',
          image: imported.image || '',
          imagePath: imported.image || '',
          hint: imported.hint || '',
          elements,
        });
        
        if (imported.image && !imported.image.startsWith('blob:')) {
          setImageUrl(imported.image);
        }
        setSelectedElementId(null);
        setUserAnswers({});
        setChecked(false);
      } catch (err) {
        alert('Ошибка при чтении JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = useCallback(async () => {
    setSaveStatus(null);
    try {
      let imagePath = unit.imagePath;
      let publicUrl = unit.image;

      // Если выбрали новое изображение, загружаем в Supabase Storage
      if (imagePath && !imagePath.startsWith('/') && imagePath !== unit.imagePath) {
        // Новый файл — загружаем (imagePath здесь — это имя файла из input)
        const file = new File([], imagePath, { type: 'image/png' });
        const fileName = `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
        const { error: uploadError, data } = await supabase
          .storage
          .from('unit-images')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw new Error('Ошибка загрузки изображения: ' + uploadError.message);

        const { data: urlData } = supabase
          .storage
          .from('unit-images')
          .getPublicUrl(fileName);

        publicUrl = urlData.publicUrl;
        imagePath = fileName;
      } else if (unit.image && unit.image.startsWith('blob:')) {
        // Если изображение — это blob URL (только что загрузили), конвертируем и загружаем
        const blob = await fetch(unit.image).then(r => r.blob());
        const fileName = `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
        const { error: uploadError, data } = await supabase
          .storage
          .from('unit-images')
          .upload(fileName, blob, { upsert: true });

        if (uploadError) throw new Error('Ошибка загрузки изображения: ' + uploadError.message);

        const { data: urlData } = supabase
          .storage
          .from('unit-images')
          .getPublicUrl(fileName);

        publicUrl = urlData.publicUrl;
        imagePath = fileName;
      }

      // Подготавливаем данные для сохранения в БД
      const elementsData = unit.elements.map((el) => ({
        id: el.id,
        type: el.type,
        x: Number(el.x.toFixed(1)),
        y: Number(el.y.toFixed(1)),
        width: Number(el.width.toFixed(1)),
        height: Number(el.height.toFixed(1)),
        ...(el.type === 'input' && { correctAnswer: el.correctAnswer }),
        ...(el.type === 'text' && {
          content: el.content,
          fontSize: el.fontSize,
          fontWeight: el.fontWeight,
          textAlign: el.textAlign,
          textColor: el.textColor,
        }),
        ...(el.type === 'choice' && {
          options: el.options,
          correctOptionId: el.correctOptionId,
          fontSize: el.fontSize,
          optionSize: el.optionSize,
          optionGap: el.optionGap,
          optionSpacing: el.optionSpacing,
          optionTextColor: el.optionTextColor,
        }),
      }));

      const unitToSave = {
        id: unit.id || `unit-${Date.now()}`,
      subject: unit.subject || 'math',
      difficulty: unit.difficulty || 3,
      starsCount: unit.starsCount || unit.difficulty || 3,
        module_name: unit.moduleName || 'Модуль',
        unit_code: unit.unitCode || unit.id || '',
        type: unit.type || 'learn',
        title: unit.title || '',
        hint: unit.hint || '',
        image_path: publicUrl || imagePath,
        elements: elementsData,
      };

      // Сохраняем или обновляем в базе данных
      const { error: dbError } = await supabase
        .from('units')
        .upsert(unitToSave, { onConflict: 'id' });

      if (dbError) throw new Error('Ошибка сохранения в БД: ' + dbError.message);

      setSaveStatus({
        type: 'success',
        message: 'Юнит успешно сохранен!',
      });

      // Сбрасываем форму или можно оставить как есть
      setUnit(DEFAULT_UNIT);
      setImageUrl(null);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus({
        type: 'error',
        message: 'Ошибка сохранения: ' + err.message,
      });
    }
  }, [unit]);

  const selectedElement = unit.elements.find((el) => el.id === selectedElementId);

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex overflow-auto">
      <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-4 flex-shrink-0 h-full">
        <EditorSidebar
          unit={unit}
          selectedElement={selectedElement}
          imageUrl={imageUrl}
          onUnitChange={setUnit}
          onImageUpload={handleImageUpload}
          onAddElement={addElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDuplicateElement={duplicateElement}
          onSelectElement={setSelectedElementId}
          onExport={handleExport}
          onCopyJson={handleCopyJson}
          onImport={handleImport}
          onSave={handleSave}
          onBack={onBack}
          fileInputRef={fileInputRef}
          generateId={generateId}
        />
      </aside>

      <main className={`flex-1 relative overflow-auto h-full w-full bg-slate-950 p-6 flex items-start ${unit?.type === 'learn' ? 'justify-center' : 'justify-start'}`}>
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${!isPreviewMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                ✏️ Редактор
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${isPreviewMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                👁️ Предпросмотр
              </button>
            </div>
          </div>

          {isPreviewMode && (
            <button
              onClick={checkAnswers}
              className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
            >
              Проверить ответы
            </button>
          )}
        </header>

        <div className="flex-1 relative overflow-auto w-full h-full">
          {(() => {
            const frameProps = {
              unitNumber: 1,
              unitId: unit?.id || '',
              moduleName: unit?.moduleName,
              unitCode: unit?.unitCode,
              subject: getSubjectLabel(unit?.subject),
              stars: unit?.starsCount || unit?.difficulty || 3,
              unitType: unit?.type || 'learn',
              onPrev: () => {},
              onNext: () => {},
              isFirst: true,
              isLast: true,
            };

            // Рамка рендерится независимо от предмета: subject влияет только на
            // текст в шапке (UniversalUnitFrame), но не на стили и не на холст.
            // Раньше для не-«math» предметов холст рендерился без белой рамки,
            // из-за чего на тёмном фоне редактора выглядел чёрным.
            return (
              <ScaledFrame unitType={unit?.type}>
                <UniversalUnitFrame
                  {...frameProps}
                  score={0}
                  isAllCorrect={false}
                  isChecked={false}
                  onRoadmapClick={() => {}}
                  onLevelClick={() => {}}
                  onNumberClick={() => {}}
                  onDateClick={() => {}}
                  onHelpClick={() => {}}
                  onCheck={checkAnswers}
                >
                  <UnitCanvas
                    ref={canvasRef}
                    imageUrl={imageUrl}
                    imageDimensions={imageDimensions}
                    elements={unit.elements}
                    selectedElementId={selectedElementId}
                    isPreviewMode={isPreviewMode}
                    onElementSelect={setSelectedElementId}
                    onElementUpdate={updateElement}
                    unitType={unit.type}
                    unit={unit}
                    userAnswers={userAnswers}
                    onUserAnswer={handleUserAnswer}
                    checked={checked}
                    onCheckAnswers={checkAnswers}
                  />
                </UniversalUnitFrame>
              </ScaledFrame>
            );
          })()}
        </div>
      </main>

      {exportJson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExportJson(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Экспорт JSON</h3>
              <button onClick={() => setExportJson(null)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-auto max-h-[60vh]">{exportJson}</pre>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCopyJson} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium">Копировать</button>
              <button onClick={() => setExportJson(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
