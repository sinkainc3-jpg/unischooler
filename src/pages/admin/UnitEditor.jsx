import React, { useState, useRef, useCallback } from 'react';
import UnitCanvas from '../../components/editor/UnitCanvas';
import EditorSidebar from '../../components/editor/EditorSidebar';

const DEFAULT_UNIT = {
  id: '',
  subject: 'math',
  type: 'learn',
  title: '',
  image: '',
  imagePath: '',
  hint: '',
  elements: [],
};

export default function UnitEditor({ onBack }) {
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageDimensions, _setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [exportJson, setExportJson] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [checked, setChecked] = useState(false);
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
        width: 80,
        height: 10,
        content: 'Текст',
        fontSize: 18,
        fontWeight: 'normal',
        textAlign: 'left',
        textColor: '#ffffff',
      };
    } else if (type === 'input') {
      newElement = {
        id: `input-${existingCount + 1}`,
        type: 'input',
        x: 10,
        y: 10 + existingCount * 8,
        width: 15,
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
        height: 15,
        options: [
          { id: 'option-1', text: 'Вариант 1' },
          { id: 'option-2', text: 'Вариант 2' },
        ],
        correctOptionId: 'option-1',
        fontSize: 18,
        optionSize: 18,
        optionGap: 8,
        optionSpacing: 8,
        optionTextColor: '#ffffff',
      };
    } else if (type === 'image') {
      newElement = {
        id: `image-${existingCount + 1}`,
        type: 'image',
        x: 20,
        y: 20,
        width: 25,
        height: 20,
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

  const selectedElement = unit.elements.find((el) => el.id === selectedElementId);

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex overflow-hidden">
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
          onBack={onBack}
          fileInputRef={fileInputRef}
          generateId={generateId}
        />
      </aside>

      <main className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
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

        <div className="flex-1 relative overflow-hidden">
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
            userAnswers={userAnswers}
            onUserAnswer={handleUserAnswer}
            checked={checked}
            onCheckAnswers={checkAnswers}
          />
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