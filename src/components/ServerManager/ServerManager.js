import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, RotateCcw, Activity, Users, Zap, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function ServerManager({ config }) {
  const { t } = useLanguage();
  const [serverStatus, setServerStatus] = useState('offline');
  const [stats, setStats] = useState({
    playerCount: 0,
    uptime: '00:00:00',
    fps: 0,
    memory: 0,
    cpu: 0
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchStats = useCallback(async () => {
    if (!config?.database) return;
    try {
      const result = await ipcRenderer?.invoke('get-server-stats', config.database);
      if (result?.success) {
        setServerStatus(result.dbOnline ? 'online' : 'offline');
        setStats(prev => ({
          ...prev,
          playerCount: result.playerCount || 0
        }));
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [config]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleStartServer = async () => {
    setLoading(true);
    try {
      const result = await ipcRenderer?.invoke('start-server', config);
      if (result?.success) {
        setServerStatus('online');
        addLog('✓ Sunucu başlatıldı', 'success');
      } else {
        addLog('✗ Sunucu başlatılamadı: ' + result?.error, 'error');
      }
    } catch (err) {
      addLog('✗ Hata: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const handleStopServer = async () => {
    setLoading(true);
    try {
      const result = await ipcRenderer?.invoke('stop-server', config);
      if (result?.success) {
        setServerStatus('offline');
        addLog('✓ Sunucu durduruldu', 'warning');
      } else {
        addLog('✗ Sunucu durdurulamadı: ' + result?.error, 'error');
      }
    } catch (err) {
      addLog('✗ Hata: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const handleRestartServer = async () => {
    await handleStopServer();
    await new Promise(r => setTimeout(r, 2000));
    await handleStartServer();
    addLog('✓ Sunucu yeniden başlatıldı', 'success');
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('tr-TR');
    setLogs(prev => [{ message, type, timestamp }, ...prev].slice(0, 50));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Sunucu Yönetimi</h1>
        <div className={`px-4 py-2 rounded-lg font-semibold ${
          serverStatus === 'online' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {serverStatus === 'online' ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleStartServer}
          disabled={loading || serverStatus === 'online'}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-semibold transition-colors"
        >
          <Play className="w-5 h-5" />
          <span>Başlat</span>
        </button>

        <button
          onClick={handleStopServer}
          disabled={loading || serverStatus === 'offline'}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-semibold transition-colors"
        >
          <Square className="w-5 h-5" />
          <span>Durdur</span>
        </button>

        <button
          onClick={handleRestartServer}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-semibold transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeniden Başlat</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Oyuncu Sayısı" value={stats.playerCount} />
        <StatCard icon={Clock} label="Uptime" value={stats.uptime} />
        <StatCard icon={Zap} label="FPS" value={stats.fps} />
        <StatCard icon={Activity} label="Memory" value={`${stats.memory}MB`} />
      </div>

      {/* Logs */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Sunucu Günlüğü</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-text-muted text-sm">Henüz günlük yok</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className={`text-sm font-mono p-2 rounded ${
                log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                <span className="text-text-muted">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6 text-cyber-green" />
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className="text-text-primary font-semibold text-lg">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default ServerManager;
