import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function UnitBank({ onOpenUnit, onBack }) {
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

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">📚 Банк юнитов</h1>
          <div className="flex gap-3">
            <button
              onClick={loadUnits}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-lg transition"
            >
              {isLoading ? 'Загрузка…' : '🔄 Обновить список'}
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-semibold rounded-lg transition"
            >
              ← Назад
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/60 bg-red-500/10 text-red-300 text-sm">
            Ошибка загрузки: {error}
          </div>
        )}

        {isLoading && units.length === 0 ? (
          <p className="text-slate-400">Загружаем юниты из базы…</p>
        ) : units.length === 0 ? (
          <p className="text-slate-400">В базе пока нет юнитов.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => {
              const elementCount = Array.isArray(unit.elements) ? unit.elements.length : 0;
              return (
                <div
                  key={unit.id}
                  className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-indigo-500/40 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-bold text-lg leading-snug break-words">
                        {unit.title || 'Без названия'}
                      </h2>
                      {unit.type && (
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
                          {unit.type}
                        </span>
                      )}
                    </div>
                    <dl className="text-sm text-slate-400 space-y-1">
                      <div className="flex gap-2">
                        <dt className="text-slate-500">ID:</dt>
                        <dd className="text-slate-300 break-all">{unit.id}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-slate-500">Предмет:</dt>
                        <dd className="text-slate-300">{unit.subject || '—'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-slate-500">Элементов:</dt>
                        <dd className="text-slate-300">{elementCount}</dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    onClick={() => onOpenUnit(unit)}
                    className="mt-4 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Открыть юнит
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
