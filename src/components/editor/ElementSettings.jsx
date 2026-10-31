import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ElementSettings({ element, onUpdate, onDelete }) {
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    setOptions(element.options || []);
  }, [element.options]);

  const handleChange = (key, value) => {
    const numValue = ['x', 'y', 'width', 'height', 'fontSize', 'optionSize', 'optionGap', 'optionSpacing'].includes(key) ? parseFloat(value) : value;
    onUpdate(element.id, { [key]: numValue });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const ext = file.name.split('.').pop();
      const filePath = `units/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('unit-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('unit-images')
        .getPublicUrl(filePath);

      onUpdate(element.id, { src: publicUrl });
    } catch (err) {
      console.error('Ошибка загрузки картинки в Storage:', err);
      alert('Ошибка при загрузке картинки: ' + (err.message || err));
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const renderImageSettings = () => (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Заменить изображение</span>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
          onChange={handleImageFileChange}
          disabled={isUploadingImage}
          className="w-full px-2.5 py-1.5 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 file:mr-3 file:py-1 file:px-2.5 file:border file:border-white/10 file:bg-zinc-800/80 file:text-zinc-200 file:rounded-lg file:cursor-pointer hover:file:bg-zinc-700 text-xs transition-all duration-200"
        />
        {isUploadingImage && (
          <span className="text-xs text-amber-400 block mt-1">Загрузка в unit-images...</span>
        )}
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Путь к картинке (src)</span>
        <input
          type="text"
          value={element.src || ''}
          onChange={(e) => onUpdate(element.id, { src: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono text-xs transition-all duration-200"
          placeholder="https://..."
        />
      </label>
      {element.src && (
        <div className="w-full h-32 bg-zinc-950/80 border border-white/10 rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-inner">
          <img src={element.src} alt="Предпросмотр" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );

  const renderTextSettings = () => (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Текст</span>
        <textarea
          value={element.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none font-mono text-xs transition-all duration-200"
          placeholder="Введите текст..."
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Размер шрифта</span>
          <input
            type="number"
            min="8"
            max="72"
            step="1"
            value={element.fontSize}
            onChange={(e) => handleChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Начертание шрифта</span>
          <select
            value={element.fontWeight}
            onChange={(e) => handleChange('fontWeight', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          >
            <option value="normal">Обычный</option>
            <option value="bold">Жирный</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Выравнивание</span>
        <select
          value={element.textAlign}
          onChange={(e) => handleChange('textAlign', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
        >
          <option value="left">По левому краю</option>
          <option value="center">По центру</option>
          <option value="right">По правому краю</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Цвет текста</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.textColor || '#18181b'}
            onChange={(e) => onUpdate(element.id, { textColor: e.target.value })}
            className="w-9 h-9 rounded-xl border border-white/10 bg-transparent cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={element.textColor || '#18181b'}
            onChange={(e) => onUpdate(element.id, { textColor: e.target.value })}
            className="flex-1 px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            placeholder="#18181b"
          />
        </div>
      </label>
    </div>
  );

  const renderInputSettings = () => (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">Правильный ответ</span>
        <input
          type="text"
          value={element.correctAnswer}
          onChange={(e) => handleChange('correctAnswer', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          placeholder="Правильный ответ"
        />
      </label>
    </div>
  );

  const renderChoiceSettings = () => {
    const addOption = () => {
      const text = newOptionText.trim() || `Вариант ${options.length + 1}`;
      const newOption = {
        id: `option-${Date.now()}`,
        text,
      };
      const newOptions = [...options, newOption];
      setOptions(newOptions);
      onUpdate(element.id, { options: newOptions });
      setNewOptionText('');
    };

    const removeOption = (optionId) => {
      if (options.length <= 2) return;
      const wasCorrect = element.correctOptionId === optionId;
      const newOptions = options.filter((o) => o.id !== optionId);
      setOptions(newOptions);
      onUpdate(element.id, { options: newOptions });
      if (wasCorrect && newOptions.length > 0) {
        onUpdate(element.id, { correctOptionId: newOptions[0].id });
      }
    };

    const updateOptionText = (optionId, text) => {
      const newOptions = options.map((o) => o.id === optionId ? { ...o, text } : o);
      setOptions(newOptions);
      onUpdate(element.id, { options: newOptions });
    };

    const handleCorrectOptionChange = (optionId) => {
      onUpdate(element.id, { correctOptionId: optionId });
    };

    const renderChoiceSizeSettings = () => (
      <div className="space-y-3 border-t border-zinc-800/80 pt-3">
        <span className="text-xs font-medium text-zinc-400 block mb-2">Размер</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Размер текста (px)</span>
            <input
              type="number"
              min="8"
              max="100"
              step="1"
              value={element.fontSize || 18}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/30 transition"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Размер индикатора (px)</span>
            <input
              type="number"
              min="8"
              max="60"
              step="1"
              value={element.optionSize || 18}
              onChange={(e) => handleChange('optionSize', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/30 transition"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Отступ до текста (px)</span>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={element.optionGap || 8}
              onChange={(e) => handleChange('optionGap', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/30 transition"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Расстояние между вариантами (px)</span>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={element.optionSpacing || 8}
              onChange={(e) => handleChange('optionSpacing', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/30 transition"
            />
          </label>
        </div>
      </div>
    );

    return (
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Правильный вариант</span>
          <select
            value={element.correctOptionId}
            onChange={(e) => handleCorrectOptionChange(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          >
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Цвет текста вариантов</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.optionTextColor || '#18181b'}
              onChange={(e) => onUpdate(element.id, { optionTextColor: e.target.value })}
              className="w-9 h-9 rounded-xl border border-white/10 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={element.optionTextColor || '#18181b'}
              onChange={(e) => onUpdate(element.id, { optionTextColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
              placeholder="#18181b"
            />
          </div>
        </label>

        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Варианты ответа</span>
            <button
              onClick={addOption}
              className="px-2.5 py-1 text-xs bg-zinc-900/60 backdrop-blur-xl hover:bg-zinc-800/70 border border-white/10 border-t-white/20 text-zinc-200 rounded-lg shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              + Добавить вариант
            </button>
          </div>

          <div className="space-y-1.5">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  checked={element.correctOptionId === opt.id}
                  onChange={() => handleCorrectOptionChange(opt.id)}
                  className="w-4 h-4 accent-zinc-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl text-zinc-100 text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="Вариант ответа"
                />
                <button
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= 2}
                  className="p-1 text-zinc-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Удалить"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {renderChoiceSizeSettings()}
      </div>
    );
  };

  return (
    <div className="border-t border-white/10 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Настройки элемента</h3>
        <span className="px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-lg border border-white/10 border-t-white/20 bg-zinc-900/60 backdrop-blur-md text-zinc-200 shadow-sm">
          {element.type === 'text' ? 'Текст' : element.type === 'choice' ? 'Выбор' : element.type === 'image' ? 'Картинка' : 'Ввод'}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-400">ID элемента</span>
        <input
          type="text"
          value={element.id}
          onChange={(e) => handleChange('id', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">X {element.type === 'image' ? '(px)' : '(%)'}</span>
          <input
            type="number"
            step={element.type === 'image' ? '1' : '0.1'}
            min="0"
            max={element.type === 'image' ? undefined : 100}
            value={element.x ?? 0}
            onChange={(e) => handleChange('x', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Y {element.type === 'image' ? '(px)' : '(%)'}</span>
          <input
            type="number"
            step={element.type === 'image' ? '1' : '0.1'}
            min="0"
            max={element.type === 'image' ? undefined : 100}
            value={element.y ?? 0}
            onChange={(e) => handleChange('y', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Ширина {element.type === 'image' ? '(px)' : '(%)'}</span>
          <input
            type="number"
            step={element.type === 'image' ? '1' : '0.1'}
            min={element.type === 'image' ? '10' : '0.1'}
            max={element.type === 'image' ? undefined : 100}
            value={element.width ?? 0}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-400">Высота {element.type === 'image' ? '(px)' : '(%)'}</span>
          <input
            type="number"
            step={element.type === 'image' ? '1' : '0.1'}
            min={element.type === 'image' ? '10' : '0.1'}
            max={element.type === 'image' ? undefined : 100}
            value={element.height ?? 0}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 border-t-white/15 rounded-xl text-zinc-100 font-mono text-xs focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
          />
        </label>
      </div>

      {element.type === 'text' ? renderTextSettings() :
        element.type === 'choice' ? renderChoiceSettings() :
        element.type === 'image' ? renderImageSettings() :
        renderInputSettings()}

      <button
        onClick={onDelete}
        className="w-full px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 border-t-red-400/40 text-red-200 rounded-xl font-medium text-xs shadow-lg shadow-black/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        Удалить элемент
      </button>
    </div>
  );
}