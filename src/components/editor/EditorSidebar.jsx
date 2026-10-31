import React, { useRef, useState } from 'react';
import ElementSettings from './ElementSettings';
import { supabase } from '../../lib/supabase';

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
  onSave,
  onBack,
  fileInputRef,
  generateId,
}) {
  const subject = unit.subject || 'math';
  const imageElementInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageElementUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
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

      const newElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        src: publicUrl,
        x: 40,
        y: 40,
        width: 300,
        height: 300,
      };

      onUnitChange((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
      onSelectElement(newElement.id);
    } catch (err) {
      console.error('Ошибка загрузки картинки:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const newElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          src: reader.result,
          x: 40,
          y: 40,
          width: 300,
          height: 300,
        };
        onUnitChange((prev) => ({
          ...prev,
          elements: [...prev.elements, newElement],
        }));
        onSelectElement(newElement.id);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    onUnitChange((prev) => ({
      ...prev,
      subject: newSubject,
    }));
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-0.5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Конструктор юнитов</h1>
        <span className="px-2.5 py-0.5 text-[11px] font-medium bg-zinc-900/60 backdrop-blur-md text-zinc-200 border border-white/10 border-t-white/20 rounded-lg shadow-sm">Админ</span>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 text-zinc-300 hover:text-white border border-white/10 border-t-white/20 hover:border-white/20 rounded-xl font-medium shadow-md shadow-black/20 transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Назад к уроку
        </button>
      )}

      <div className="space-y-3.5">
        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Предмет</span>
          <select
            value={subject}
            onChange={handleSubjectChange}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          >
            <option value="math">Математика</option>
            <option value="russian">Русский язык</option>
            <option value="history">История</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Сложность (Количество звезд)</span>
          <select
             value={String(unit.starsCount || unit.difficulty || 3)}
             onChange={(e) => {
               const starsCount = Number(e.target.value);
               onUnitChange({ ...unit, starsCount, difficulty: starsCount });
             }}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          >
            <option value="1">1 звезда</option>
            <option value="2">2 звезды</option>
            <option value="3">3 звезды</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">ID юнита</span>
          <input
            type="text"
            value={unit.id}
            onChange={(e) => onUnitChange({ ...unit, id: e.target.value || generateId() })}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            placeholder={generateId()}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Название</span>
          <input
            type="text"
            value={unit.title}
            onChange={(e) => onUnitChange({ ...unit, title: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            placeholder="Название юнита"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Название модуля</span>
          <input
            type="text"
            value={unit.moduleName || ''}
            onChange={(e) => onUnitChange({ ...unit, moduleName: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            placeholder="Модуль"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Кодировка юнита</span>
          <input
            type="text"
            value={unit.unitCode || ''}
            onChange={(e) => onUnitChange({ ...unit, unitCode: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            placeholder="0000-0000-0000"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Подсказка (hint)</span>
          <textarea
            value={unit.hint}
            onChange={(e) => onUnitChange({ ...unit, hint: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:bg-zinc-900/90 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none transition-all duration-200"
            placeholder="Текст подсказки для ученика..."
          />
        </label>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-200">Элементы ({unit.elements.length})</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => onAddElement('input')}
            className="px-2.5 py-2 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 border border-white/10 border-t-white/20 hover:border-white/20 text-zinc-200 hover:text-white rounded-xl font-medium shadow-md shadow-black/20 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="text-zinc-400 font-mono text-[11px]">[I]</span> + Ввод
          </button>
          <button
            onClick={() => onAddElement('text')}
            className="px-2.5 py-2 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 border border-white/10 border-t-white/20 hover:border-white/20 text-zinc-200 hover:text-white rounded-xl font-medium shadow-md shadow-black/20 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="text-zinc-400 font-mono text-[11px]">T</span> + Текст
          </button>
          <button
            onClick={() => onAddElement('choice')}
            className="px-2.5 py-2 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 border border-white/10 border-t-white/20 hover:border-white/20 text-zinc-200 hover:text-white rounded-xl font-medium shadow-md shadow-black/20 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="text-zinc-400 font-mono text-[11px]">○</span> + Выбор
          </button>
          <input
            ref={imageElementInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            className="hidden"
            onChange={handleImageElementUpload}
          />
          <button
            type="button"
            onClick={() => imageElementInputRef.current?.click()}
            disabled={isUploadingImage}
            className="px-2.5 py-2 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 border border-white/10 border-t-white/20 hover:border-white/20 text-zinc-200 hover:text-white disabled:opacity-40 rounded-xl font-medium shadow-md shadow-black/20 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            title="Загрузить картинку на холст"
          >
            <span className="text-zinc-400 font-mono text-[11px]">🖼</span> {isUploadingImage ? 'Загрузка…' : '+ Картинка'}
          </button>
        </div>

        {unit.elements.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-4">Элементов пока нет. Добавьте элементы с помощью кнопок выше.</p>
        ) : (
          <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
            {unit.elements.map((element) => (
              <li
                key={element.id}
                onClick={() => onSelectElement(element.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                  selectedElement?.id === element.id
                    ? 'bg-zinc-800/80 backdrop-blur-xl border border-white/20 border-t-white/30 text-white shadow-lg shadow-black/30'
                    : 'bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/50 border border-white/5 hover:border-white/10 text-zinc-300'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded-md border border-white/10 bg-zinc-800/80 text-zinc-300 font-mono text-[10px] font-medium flex items-center justify-center">
                  {element.type === 'text' ? 'T' : element.type === 'choice' ? 'C' : element.type === 'image' ? 'IMG' : 'I'}
                </span>
                <span className="flex-1 font-mono text-xs truncate">{element.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateElement(element.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Дублировать"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(element.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                  title="Удалить"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      <div className="border-t border-white/10 pt-4 space-y-2.5">
        <button
          onClick={onExport}
          className="w-full px-4 py-2.5 bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 text-zinc-200 hover:text-white border border-white/10 border-t-white/20 hover:border-white/20 rounded-xl font-medium text-xs transition-all duration-200 shadow-lg shadow-black/20 active:scale-[0.98] cursor-pointer"
        >
          Экспорт JSON
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCopyJson}
            disabled={!unit.elements.length}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 text-zinc-300 hover:text-white border border-white/10 border-t-white/20 hover:border-white/20 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-black/20 active:scale-[0.98] cursor-pointer"
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
              className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 text-zinc-300 hover:text-white border border-white/10 border-t-white/20 hover:border-white/20 rounded-xl text-xs font-medium transition-all duration-200 shadow-md shadow-black/20 active:scale-[0.98] cursor-pointer"
            >
              Импорт JSON
            </button>
          </label>
        </div>

        <button
          onClick={onSave}
          disabled={!unit.title}
          className="w-full px-4 py-2.5 bg-white/95 hover:bg-white text-zinc-950 rounded-xl font-semibold text-sm transition-all duration-200 shadow-xl shadow-black/30 border border-white/40 border-t-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Сохранить юнит в базу
        </button>
      </div>
    </div>
  );
}
