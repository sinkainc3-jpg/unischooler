import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function UnitBank({ onOpenUnit, onEditUnit, onBack }) {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUnits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('units')
        .select('*');

      if (fetchError) throw fetchError;
      setUnits(data || []);
    } catch (err) {
      console.error('UnitBank load error:', err);
      setError(err.message || 'Не удалось загрузить список юнитов');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleDelete = useCallback(async (unit) => {
    if (!window.confirm(`Удалить юнит «${unit.title || unit.id}»?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('units')
        .delete()
        .eq('id', unit.id);

      if (deleteError) throw deleteError;

      setUnits((prev) => prev.filter((u) => u.id !== unit.id));
    } catch (err) {
      console.error('UnitBank delete error:', err);
      alert('Ошибка удаления: ' + (err.message || 'Неизвестная ошибка'));
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100">📚 Банк юнитов</h1>
          <div className="flex gap-2.5">
            <button
              onClick={loadUnits}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 border-t-white/20 hover:bg-zinc-800/70 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-zinc-200 rounded-xl transition-all duration-200 shadow-lg shadow-black/30 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? 'Загрузка…' : '🔄 Обновить список'}
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 border-t-white/20 hover:bg-zinc-800/70 hover:border-white/20 text-xs font-medium text-zinc-300 hover:text-white rounded-xl transition-all duration-200 shadow-lg shadow-black/30 active:scale-[0.98] cursor-pointer"
            >
              ← Назад
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
            Ошибка загрузки: {error}
          </div>
        )}

        {isLoading && units.length === 0 ? (
          <p className="text-zinc-500 text-sm">Загружаем юниты из базы…</p>
        ) : units.length === 0 ? (
          <p className="text-zinc-500 text-sm">В базе пока нет юнитов.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => {
              const elementCount = Array.isArray(unit.elements) ? unit.elements.length : 0;
              return (
                <div
                  key={unit.id}
                  className="flex flex-col bg-zinc-900/50 backdrop-blur-xl border border-white/10 border-t-white/20 hover:border-white/20 rounded-2xl p-4.5 shadow-xl shadow-black/30 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-semibold text-base leading-snug break-words text-zinc-100">
                        {unit.title || 'Без названия'}
                      </h2>
                      {unit.type && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-white/10 border-t-white/20 bg-zinc-800/70 text-zinc-300">
                          {unit.type}
                        </span>
                      )}
                    </div>
                    <dl className="text-xs text-zinc-400 space-y-1">
                      <div className="flex gap-2">
                        <dt className="text-zinc-500">ID:</dt>
                        <dd className="text-zinc-300 font-mono break-all">{unit.id}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-zinc-500">Предмет:</dt>
                        <dd className="text-zinc-300">{unit.subject || '—'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-zinc-500">Элементов:</dt>
                        <dd className="text-zinc-300 font-mono">{elementCount}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onOpenUnit(unit)}
                      className="flex-1 px-3 py-1.5 bg-white/95 hover:bg-white text-zinc-950 text-xs font-semibold rounded-xl shadow-md border border-white/40 border-t-white transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      👁️ Открыть
                    </button>
                    {onEditUnit && (
                      <button
                        onClick={() => onEditUnit(unit)}
                        className="px-3 py-1.5 bg-zinc-800/70 hover:bg-zinc-700/80 border border-white/10 border-t-white/20 text-zinc-200 text-xs font-medium rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
                        title="Редактировать юнит"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(unit)}
                      className="px-3 py-1.5 bg-zinc-800/70 hover:bg-red-950/50 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-300 text-xs font-medium rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
                      title="Удалить юнит"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
