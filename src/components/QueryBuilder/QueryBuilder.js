import React, { useState, useCallback } from 'react';
import { Play, Copy, Download, Trash2, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function QueryBuilder({ config }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('SELECT * FROM player LIMIT 10;');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedQueries, setSavedQueries] = useState(
    JSON.parse(localStorage.getItem('saved-queries') || '[]')
  );
  const [queryName, setQueryName] = useState('');

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Query boş olamaz');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const result = await ipcRenderer?.invoke('execute-sql', {
        sql: query,
        params: [],
        config: config.database
      });

      if (result?.success) {
        setResults(result.data || []);
      } else {
        setError(result?.error || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSaveQuery = () => {
    if (!queryName.trim()) {
      alert('Query adı giriniz');
      return;
    }

    const newQuery = { id: Date.now(), name: queryName, sql: query };
    const updated = [...savedQueries, newQuery];
    setSavedQueries(updated);
    localStorage.setItem('saved-queries', JSON.stringify(updated));
    setQueryName('');
    alert('Query kaydedildi');
  };

  const handleLoadQuery = (savedQuery) => {
    setQuery(savedQuery.sql);
  };

  const handleDeleteSavedQuery = (id) => {
    const updated = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updated);
    localStorage.setItem('saved-queries', JSON.stringify(updated));
  };

  const handleCopyResults = () => {
    const csv = [
      Object.keys(results[0] || {}).join(','),
      ...results.map(r => Object.values(r).join(','))
    ].join('\n');
    navigator.clipboard.writeText(csv);
    alert('Sonuçlar kopyalandı');
  };

  const handleDownloadResults = () => {
    const csv = [
      Object.keys(results[0] || {}).join(','),
      ...results.map(r => Object.values(r).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Query Builder</h1>
        <p className="text-text-muted">SQL sorguları çalıştırın ve sonuçları görüntüleyin</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Query Editor */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className="block text-text-primary text-sm font-medium mb-2">SQL Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-48 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-cyber-green"
              placeholder="SELECT * FROM player LIMIT 10;"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={executeQuery}
              disabled={loading}
              className="flex items-center space-x-2 bg-cyber-green text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>{loading ? 'Çalışıyor...' : 'Çalıştır'}</span>
            </button>

            <button
              onClick={() => setQuery('')}
              className="flex items-center space-x-2 bg-dark-hover text-text-primary px-4 py-2 rounded-lg font-semibold hover:bg-dark-border"
            >
              <Trash2 className="w-5 h-5" />
              <span>Temizle</span>
            </button>
          </div>

          {/* Save Query */}
          <div className="flex gap-2">
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="Query adı..."
              className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-green"
            />
            <button
              onClick={handleSaveQuery}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              <span>Kaydet</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-text-primary font-semibold">
                  Sonuçlar: {results.length} satır
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyResults}
                    className="flex items-center space-x-1 text-sm bg-dark-hover px-3 py-1 rounded hover:bg-dark-border transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </button>
                  <button
                    onClick={handleDownloadResults}
                    className="flex items-center space-x-1 text-sm bg-dark-hover px-3 py-1 rounded hover:bg-dark-border transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>İndir</span>
                  </button>
                </div>
              </div>

              <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-hover border-b border-dark-border sticky top-0">
                      <tr>
                        {Object.keys(results[0] || {}).map(key => (
                          <th key={key} className="px-4 py-2 text-left text-text-primary font-semibold">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx} className="border-b border-dark-border hover:bg-dark-hover">
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="px-4 py-2 text-text-secondary">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Queries Sidebar */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 h-fit">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Kaydedilen Sorgular</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedQueries.length === 0 ? (
              <p className="text-text-muted text-sm">Henüz kaydedilen sorgu yok</p>
            ) : (
              savedQueries.map(sq => (
                <div key={sq.id} className="bg-dark-hover rounded-lg p-3 group">
                  <button
                    onClick={() => handleLoadQuery(sq)}
                    className="w-full text-left text-sm text-text-primary hover:text-cyber-green transition-colors truncate"
                    title={sq.sql}
                  >
                    {sq.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSavedQuery(sq.id)}
                    className="opacity-0 group-hover:opacity-100 mt-2 w-full text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-all"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryBuilder;
