import React from 'react';
import ElementSettings from './ElementSettings';

export default function EditorSidebar({
  unit,
  selectedElement,
  imageUrl,
  onUnitChange,
  onImageUpload,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onSelectElement,
  onExport,
  onCopyJson,
  onImport,
  onBack,
  fileInputRef,
  generateId,
}) {
  const subject = unit.subject || 'math';
  const isMath = subject === 'math';

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    onUnitChange((prev) => {
      const next = { ...prev, subject: newSubject };
      if (newSubject === 'math' && !prev.type) {
        next.type = 'learn';
      }
      if (newSubject === 'russian') {
        delete next.type;
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Конструктор юнитов</h1>
        <span className="px-2 py-1 text-xs bg-indigo-600 rounded">Админ</span>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Назад к уроку
        </button>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">Предмет</span>
          <select
            value={subject}
            onChange={handleSubjectChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="math">Математика</option>
            <option value="russian">Русский язык</option>
          </select>
        </label>

        {isMath && (
          <label className="block">
            <span className="text-xs text-slate-400 block mb-1">Тип юнита</span>
            <select
              value={unit.type || 'learn'}
              onChange={(e) => onUnitChange({ ...unit, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="learn">Учебный</option>
              <option value="train">Тренировочный</option>
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">ID юнита</span>
          <input
            type="text"
            value={unit.id}
            onChange={(e) => onUnitChange({ ...unit, id: e.target.value || generateId() })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={generateId()}
          />
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">Название</span>
          <input
            type="text"
            value={unit.title}
            onChange={(e) => onUnitChange({ ...unit, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Название юнита"
          />
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">Подсказка (hint)</span>
          <textarea
            value={unit.hint}
            onChange={(e) => onUnitChange({ ...unit, hint: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="Текст подсказки для ученика..."
          />
        </label>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-4">
        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">PNG страница</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={onImageUpload}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-indigo-600 file:text-white file:rounded file:cursor-pointer hover:file:bg-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-xs text-slate-400 block mb-1">Путь к PNG (для JSON)</span>
          <input
            type="text"
            value={unit.imagePath}
            onChange={(e) => onUnitChange({ ...unit, imagePath: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
            placeholder="/content/percentages/percent-05.png"
          />
          <p className="text-xs text-slate-500 mt-1">Путь, который будет записан в JSON. Файл не загружается.</p>
        </label>

        {imageUrl && (
          <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <img
              src={imageUrl}
              alt="Предпросмотр"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Элементы ({unit.elements.length})</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onAddElement('input')}
            className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition"
          >
            + Добавить поле ввода
          </button>
          <button
            onClick={() => onAddElement('text')}
            className="flex-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 rounded-lg font-medium transition"
          >
            + Добавить текст
          </button>
          <button
            onClick={() => onAddElement('choice')}
            className="flex-1 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition"
          >
            + Добавить выбор
          </button>
          <button
            onClick={() => onAddElement('image')}
            className="flex-1 px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition"
          >
            + Картинка
          </button>
        </div>

        {unit.elements.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Элементов пока нет. Нажмите «+ Добавить поле ввода» или «+ Добавить текст»</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {unit.elements.map((element) => (
              <li
                key={element.id}
                onClick={() => onSelectElement(element.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                  selectedElement?.id === element.id
                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                  element.type === 'text' ? 'bg-green-500/30 text-green-400' : 
                  element.type === 'choice' ? 'bg-purple-500/30 text-purple-400' :
                  'bg-indigo-500/30 text-indigo-400'
                }`}>
                  {element.type === 'text' ? 'T' : element.type === 'choice' ? 'C' : 'I'}
                </span>
                <span className="flex-1 font-mono text-sm truncate">{element.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateElement(element.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  title="Дублировать"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(element.id);
                  }}
                  className="p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  title="Удалить"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedElement && (
        <ElementSettings
          element={selectedElement}
          onUpdate={onUpdateElement}
          onDelete={() => onDeleteElement(selectedElement.id)}
        />
      )}

      <div className="border-t border-slate-800 pt-4 space-y-3">
        <button
          onClick={onExport}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-lg transition"
        >
          Экспорт JSON
        </button>

        <button
          onClick={onCopyJson}
          disabled={!unit.elements.length}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Копировать JSON
        </button>

        <label className="w-full">
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="sr-only"
            id="import-json"
          />
          <button
            type="button"
            onClick={() => document.getElementById('import-json').click()}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition"
          >
            Импорт JSON
          </button>
        </label>

        <button
          onClick={onSave}
          disabled={!unit.title}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Сохранить юнит
        </button>
      </div>
    </div>
  );
}