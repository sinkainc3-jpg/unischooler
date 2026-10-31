import React, { useState, useRef, useCallback } from 'react';
import UnitCanvas from '../../components/editor/UnitCanvas';
import EditorSidebar from '../../components/editor/EditorSidebar';
import UniversalUnitFrame from '../../components/UniversalUnitFrame';
import AutoFitFrame from '../../components/AutoFitFrame';
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
  <div className="w-[680px] shrink-0 flex flex-col items-center justify-center">
    {children}
  </div>
);

// Преобразует юнит из формата Supabase в формат редактора
function unitFromDbToEditor(dbUnit) {
  return {
    id: dbUnit.id || '',
    subject: dbUnit.subject || 'math',
    type: dbUnit.type || 'learn',
    difficulty: dbUnit.difficulty || 3,
    starsCount: dbUnit.starsCount || dbUnit.difficulty || 3,
    moduleName: dbUnit.module_name || dbUnit.moduleName || 'Модуль',
    unitCode: dbUnit.unit_code || dbUnit.unitCode || '',
    title: dbUnit.title || '',
    image: dbUnit.image_path || dbUnit.image || '',
    imagePath: dbUnit.image_path || dbUnit.image || '',
    hint: dbUnit.hint || '',
    elements: Array.isArray(dbUnit.elements) ? dbUnit.elements : [],
  };
}

export default function UnitEditor({ onBack, initialUnit }) {
  const [unit, setUnit] = useState(() => {
    if (initialUnit) return unitFromDbToEditor(initialUnit);
    return DEFAULT_UNIT;
  });
  const [editingUnitId, setEditingUnitId] = useState(initialUnit?.id || null);
  const [imageUrl, setImageUrl] = useState(() => {
    if (initialUnit) {
      const img = initialUnit.image_path || initialUnit.image || '';
      return img && !img.startsWith('blob:') ? img : null;
    }
    return null;
  });
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

  const handleResetToNew = useCallback(() => {
    setUnit(DEFAULT_UNIT);
    setEditingUnitId(null);
    setImageUrl(null);
    setSelectedElementId(null);
    setIsPreviewMode(false);
    setUserAnswers({});
    setChecked(false);
    setSaveStatus(null);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    try {
      const ext = file.name.split('.').pop();
      const filePath = `units/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error } = await supabase.storage
        .from('unit-images')
        .upload(filePath, file);

      let publicUrl = '';
      if (!error) {
        const res = supabase.storage
          .from('unit-images')
          .getPublicUrl(filePath);
        publicUrl = res.data?.publicUrl || '';
      }

      if (!publicUrl) {
        publicUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const newImageElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        src: publicUrl,
        x: 40,
        y: 40,
        width: 300,
        height: 300,
      };

      setUnit((prev) => ({
        ...prev,
        elements: [...prev.elements, newImageElement],
      }));
      setSelectedElementId(newImageElement.id);
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = () => {
        const newImageElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          src: reader.result,
          x: 40,
          y: 40,
          width: 300,
          height: 300,
        };
        setUnit((prev) => ({
          ...prev,
          elements: [...prev.elements, newImageElement],
        }));
        setSelectedElementId(newImageElement.id);
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
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
        id: `img-${Date.now()}`,
        type: 'image',
        x: 40,
        y: 40,
        width: 300,
        height: 300,
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
      else if (element.type === 'image') baseId = 'img';
      else baseId = 'element';
      
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
    
    exportUnit.type = unit.type || 'learn';
    
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

        setUnit({
          id: imported.id || '',
          subject: subject,
          difficulty: imported.difficulty || 3,
          starsCount: imported.starsCount || imported.difficulty || 3,
          moduleName: imported.moduleName || imported.module_name || 'Модуль',
          unitCode: imported.unitCode || imported.unit_code || '',
          type: imported.type || 'learn',
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
        x: Number((Number(el.x) || 0).toFixed(1)),
        y: Number((Number(el.y) || 0).toFixed(1)),
        width: Number((Number(el.width) || 0).toFixed(1)),
        height: Number((Number(el.height) || 0).toFixed(1)),
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
        ...(el.type === 'image' && { src: el.src }),
      }));

      const unitId = editingUnitId || unit.id || `unit-${Date.now()}`;

      const unitToSave = {
        id: unitId,
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

      const isEditing = !!editingUnitId;

      setSaveStatus({
        type: 'success',
        message: isEditing
          ? 'Юнит успешно обновлён!'
          : 'Юнит успешно сохранён!',
      });

      // Обновляем id в стейте, чтобы повторное сохранение делало upsert
      setEditingUnitId(unitId);
      setUnit((prev) => ({ ...prev, id: unitId }));
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus({
        type: 'error',
        message: 'Ошибка сохранения: ' + err.message,
      });
    }
  }, [unit, editingUnitId]);

  const selectedElement = unit.elements.find((el) => el.id === selectedElementId);

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex overflow-hidden">
      <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-4 shrink-0 h-full overflow-y-auto">
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

      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-950 overflow-hidden">
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10 shrink-0 w-full">
          <div className="flex items-center gap-3">
            {editingUnitId && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-600/20 border border-amber-500/40 text-amber-300">
                ✏️ Редактирование: {unit.title || editingUnitId}
              </span>
            )}
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

          <div className="flex items-center gap-2">
            {editingUnitId && (
              <button
                onClick={handleResetToNew}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition"
              >
                ➕ Создать новый
              </button>
            )}

            {saveStatus && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  saveStatus.type === 'success'
                    ? 'bg-green-600/20 text-green-300 border border-green-500/40'
                    : 'bg-red-600/20 text-red-300 border border-red-500/40'
                }`}
              >
                {saveStatus.message}
              </span>
            )}

            {isPreviewMode && (
              <button
                onClick={checkAnswers}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
              >
                Проверить ответы
              </button>
            )}
          </div>
        </header>

        {/* Контейнер с динамическим авто-вписыванием бланка (Fit to Screen) */}
        <AutoFitFrame className="flex-1 min-w-0">
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
            return (
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
            );
          })()}
        </AutoFitFrame>
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
