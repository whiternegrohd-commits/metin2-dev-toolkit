import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Play, Pause, Trash2, Upload, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

const LEVEL_COLORS = {
  ERROR: 'text-danger',
  CRITICAL: 'text-purple-400',
  WARNING: 'text-warning',
  WARN: 'text-warning',
  INFO: 'text-cyber-green',
  DEBUG: 'text-text-muted'
};

const LEVEL_BG = {
  ERROR: 'bg-danger/5',
  CRITICAL: 'bg-purple-400/5',
  WARNING: 'bg-warning/5',
  WARN: 'bg-warning/5',
  INFO: '',
  DEBUG: ''
};

function parseLevel(line) {
  const upper = line.toUpperCase();
  if (upper.includes('CRITICAL')) return 'CRITICAL';
  if (upper.includes('ERROR') || upper.includes('ERR')) return 'ERROR';
  if (upper.includes('WARNING') || upper.includes('WARN')) return 'WARNING';
  if (upper.includes('DEBUG')) return 'DEBUG';
  return 'INFO';
}

function LogAnalyzer({ config }) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [filePath, setFilePath] = useState('');
  const [watching, setWatching] = useState(false);
  const [filters, setFilters] = useState({ ERROR: true, CRITICAL: true, WARNING: true, INFO: true, DEBUG: false });
  const [stats, setStats] = useState({ ERROR: 0, CRITICAL: 0, WARNING: 0, INFO: 0 });
  const intervalRef = useRef(null);
  const logEndRef = useRef(null);
  const lastLineCount = useRef(0);

  // Config'den server path varsa syserr'i otomatik bul
  useEffect(() => {
    if (config?.paths?.server && !filePath) {
      autoFindLog(config.paths.server);
    }
  }, [config]);

  const autoFindLog = async (serverPath) => {
    if (!ipcRenderer || !serverPath) return;
    // Yaygın syserr konumları
    const candidates = [
      `${serverPath}/syserr`,
      `${serverPath}/log/syserr`,
      `${serverPath}/channel1/syserr`,
      `${serverPath}/game/syserr`,
    ];
    for (const p of candidates) {
      const result = await ipcRenderer.invoke('read-log-tail', p, 10).catch(() => null);
      if (result?.success) {
        setFilePath(p);
        await fetchLogs(p);
        return;
      }
    }
  };

  const loadFile = async () => {
    if (!ipcRenderer) {
      const mockLogs = [
        { time: new Date().toLocaleTimeString(), level: 'INFO', message: 'Server started successfully', raw: '' },
        { time: new Date().toLocaleTimeString(), level: 'WARNING', message: 'High memory usage: 78%', raw: '' },
        { time: new Date().toLocaleTimeString(), level: 'ERROR', message: 'Database query timeout', raw: '' },
        { time: new Date().toLocaleTimeString(), level: 'INFO', message: 'Player connected: TestUser', raw: '' },
      ];
      setLogs(mockLogs);
      setFilePath('mock/syslog');
      updateStats(mockLogs);
      return;
    }
    const path = await ipcRenderer.invoke('select-file', [
      { name: 'Log Files', extensions: ['txt', 'log', ''] },
      { name: 'All Files', extensions: ['*'] }
    ]);
    if (!path) return;
    setFilePath(path);
    lastLineCount.current = 0;
    await fetchLogs(path);
  };

  const fetchLogs = useCallback(async (path) => {
    if (!path || !ipcRenderer) return;
    const result = await ipcRenderer.invoke('read-log-tail', path, 500);
    if (!result.success) return;
    const parsed = result.lines.map(line => {
      const level = parseLevel(line);
      // Zaman damgası çıkarmaya çalış
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
      return { time: timeMatch ? timeMatch[1] : '', level, message: line, raw: line };
    });
    if (parsed.length !== lastLineCount.current) {
      lastLineCount.current = parsed.length;
      setLogs(parsed);
      updateStats(parsed);
    }
  }, []);

  const updateStats = (logList) => {
    const s = { ERROR: 0, CRITICAL: 0, WARNING: 0, INFO: 0 };
    logList.forEach(l => {
      if (s[l.level] !== undefined) s[l.level]++;
    });
    setStats(s);
  };

  const startWatching = () => {
    if (!filePath) return;
    setWatching(true);
    intervalRef.current = setInterval(() => fetchLogs(filePath), 2000);
  };

  const stopWatching = () => {
    setWatching(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(l => filters[l.level] !== false);

  const statItems = [
    { key: 'INFO', color: 'text-cyber-green', bg: 'bg-cyber-green/10' },
    { key: 'WARNING', color: 'text-warning', bg: 'bg-warning/10' },
    { key: 'ERROR', color: 'text-danger', bg: 'bg-danger/10' },
    { key: 'CRITICAL', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="h-full flex space-x-4">
      {/* Ana log alanı */}
      <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-warning/10 rounded-lg border border-warning/20">
              <Activity className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary">{t('log_analyzer_title')}</h1>
              {filePath && (
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-text-muted font-mono">{filePath}</p>
                  {watching && <span className="text-xs text-success animate-pulse">● {t('watching')}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={loadFile}
              className="flex items-center space-x-1.5 px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-sm transition-colors hover:bg-dark-border">
              <Upload className="w-3.5 h-3.5" />
              <span>{t('select_log_file')}</span>
            </button>
            {filePath && !watching && (
              <button onClick={startWatching}
                className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-sm transition-colors">
                <Play className="w-3.5 h-3.5" />
                <span>{t('watching')}</span>
              </button>
            )}
            {watching && (
              <button onClick={stopWatching}
                className="flex items-center space-x-1.5 px-3 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/30 rounded-lg text-danger text-sm transition-colors">
                <Pause className="w-3.5 h-3.5" />
                <span>{t('stopped')}</span>
              </button>
            )}
            {logs.length > 0 && (
              <button onClick={() => { setLogs([]); lastLineCount.current = 0; }}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors" title={t('clear_logs')}>
                <Trash2 className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-dark-bg rounded-lg border border-dark-border overflow-auto font-mono text-xs">
          {filteredLogs.length > 0 ? (
            <div className="p-3 space-y-0.5">
              {filteredLogs.map((log, i) => (
                <div key={i} className={`flex items-start space-x-3 py-1 px-2 rounded ${LEVEL_BG[log.level] || ''}`}>
                  {log.time && <span className="text-text-muted flex-shrink-0 w-20">{log.time}</span>}
                  <span className={`font-semibold flex-shrink-0 w-16 ${LEVEL_COLORS[log.level] || 'text-text-muted'}`}>
                    [{log.level}]
                  </span>
                  <span className="text-text-primary break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">{t('select_log_file')}</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted mt-2">{filteredLogs.length} satır gösteriliyor</p>
      </div>

      {/* Sağ panel */}
      <div className="w-64 space-y-4">
        {/* Stats */}
        <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">{t('statistics')}</h3>
          <div className="space-y-2">
            {statItems.map(s => (
              <div key={s.key} className={`flex items-center justify-between p-2 rounded-lg ${s.bg}`}>
                <span className={`text-xs font-medium ${s.color}`}>{s.key}</span>
                <span className={`text-sm font-mono font-bold ${s.color}`}>{stats[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">{t('filters')}</h3>
          <div className="space-y-2">
            {Object.keys(filters).map(level => (
              <label key={level} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={filters[level]}
                  onChange={e => setFilters(p => ({ ...p, [level]: e.target.checked }))}
                  className="rounded border-dark-border bg-dark-surface text-cyber-green focus:ring-cyber-green" />
                <span className={`text-xs ${LEVEL_COLORS[level] || 'text-text-muted'}`}>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Son hatalar */}
        <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">{t('recent_errors')}</h3>
          <div className="space-y-2">
            {logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').slice(-5).reverse().map((log, i) => (
              <div key={i} className="p-2 bg-dark-hover rounded-lg border border-dark-border">
                {log.time && <p className="text-xs text-text-muted font-mono mb-0.5">{log.time}</p>}
                <p className={`text-xs ${LEVEL_COLORS[log.level]}`}>{log.message.slice(0, 80)}{log.message.length > 80 ? '...' : ''}</p>
              </div>
            ))}
            {logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length === 0 && (
              <p className="text-xs text-text-muted text-center py-2">Hata yok ✓</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogAnalyzer;
