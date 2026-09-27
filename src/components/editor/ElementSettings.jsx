import React, { useState, useEffect } from 'react';

export default function ElementSettings({ element, onUpdate, onDelete }) {
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');

  useEffect(() => {
    setOptions(element.options || []);
  }, [element.options]);

  const handleChange = (key, value) => {
    const numValue = ['x', 'y', 'width', 'height', 'fontSize', 'optionSize', 'optionGap', 'optionSpacing'].includes(key) ? parseFloat(value) : value;
    onUpdate(element.id, { [key]: numValue });
  };

  const renderTextSettings = () => (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Text</span>
        <textarea
          value={element.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
          placeholder="Текст элемента"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Font size</span>
          <input
            type="number"
            min="8"
            max="72"
            step="1"
            value={element.fontSize}
            onChange={(e) => handleChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Font weight</span>
          <select
            value={element.fontWeight}
            onChange={(e) => handleChange('fontWeight', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Text align</span>
        <select
          value={element.textAlign}
          onChange={(e) => handleChange('textAlign', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Цвет текста</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.textColor || '#ffffff'}
            onChange={(e) => onUpdate(element.id, { textColor: e.target.value })}
            className="w-10 h-10 rounded border border-slate-700 cursor-pointer"
          />
          <input
            type="text"
            value={element.textColor || '#ffffff'}
            onChange={(e) => onUpdate(element.id, { textColor: e.target.value })}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
            placeholder="#ffffff"
          />
        </div>
      </label>
    </div>
  );

  const renderInputSettings = () => (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Correct answer</span>
        <input
          type="text"
          value={element.correctAnswer}
          onChange={(e) => handleChange('correctAnswer', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Правильный ответ"
        />
      </label>
    </div>
  );

  const renderChoiceSettings = () => {
    const addOption = () => {
      if (!newOptionText.trim()) return;
      const newOption = {
        id: `option-${Date.now()}`,
        text: newOptionText.trim(),
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
      <div className="space-y-3 border-t border-slate-800 pt-3">
        <span className="text-xs text-slate-400 font-medium block mb-2">Размер</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-slate-400">Размер текста (px)</span>
            <input
              type="number"
              min="8"
              max="100"
              step="1"
              value={element.fontSize || 18}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-slate-400">Размер кружка (px)</span>
            <input
              type="number"
              min="8"
              max="60"
              step="1"
              value={element.optionSize || 18}
              onChange={(e) => handleChange('optionSize', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-slate-400">Расстояние до текста (px)</span>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={element.optionGap || 8}
              onChange={(e) => handleChange('optionGap', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-slate-400">Расстояние между вариантами (px)</span>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={element.optionSpacing || 8}
              onChange={(e) => handleChange('optionSpacing', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    );

    return (
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Correct option</span>
          <select
            value={element.correctOptionId}
            onChange={(e) => handleCorrectOptionChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Цвет текста вариантов</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.optionTextColor || '#ffffff'}
              onChange={(e) => onUpdate(element.id, { optionTextColor: e.target.value })}
              className="w-10 h-10 rounded border border-slate-700 cursor-pointer"
            />
            <input
              type="text"
              value={element.optionTextColor || '#ffffff'}
              onChange={(e) => onUpdate(element.id, { optionTextColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
              placeholder="#ffffff"
            />
          </div>
        </label>

        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Варианты ответа</span>
            <button
              onClick={addOption}
              disabled={!newOptionText.trim()}
              className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Добавить вариант
            </button>
          </div>

          <div className="space-y-1">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  checked={element.correctOptionId === opt.id}
                  onChange={() => handleCorrectOptionChange(opt.id)}
                  className="w-4 h-4 text-purple-500 border-slate-600 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Option text"
                />
                <button
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= 2}
                  className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove option"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <div className="border-t border-slate-800 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Настройки элемента</h3>
        <span className={`px-2 py-0.5 text-xs rounded ${
          element.type === 'text' ? 'bg-green-500/30 text-green-400' :
          element.type === 'choice' ? 'bg-purple-500/30 text-purple-400' :
          'bg-indigo-500/30 text-indigo-400'
        }`}>
          {element.type === 'text' ? 'Текст' : element.type === 'choice' ? 'Выбор' : 'Поле ввода'}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">Element ID</span>
        <input
          type="text"
          value={element.id}
          onChange={(e) => handleChange('id', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs text-slate-400">X (%)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={element.x}
            onChange={(e) => handleChange('x', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Y (%)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={element.y}
            onChange={(e) => handleChange('y', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Width (%)</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={element.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-slate-400">Height (%)</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={element.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
      </div>

      {element.type === 'text' ? renderTextSettings() :
       element.type === 'choice' ? renderChoiceSettings() :
       renderInputSettings()}

      <button
        onClick={onDelete}
        className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition"
      >
        Delete element
      </button>
    </div>
  );
}