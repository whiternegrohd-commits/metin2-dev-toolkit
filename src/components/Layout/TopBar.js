import React, { useState, useEffect } from 'react';
import {
  Database, Users, Wifi, WifiOff, AlertTriangle,
  Settings, Bell, Download, X, CheckCircle, Info, AlertCircle,
  Minus, Square, XCircle, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SettingsModal from './SettingsModal';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function TopBar({ serverStatus, config, onConfigUpdate }) {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPingTooltip, setShowPingTooltip] = useState(false);
  const [pingInfo, setPingInfo] = useState({ ping: null, ip: null });
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: t('info'), message: 'Metin2 Dev Toolkit başlatıldı', time: new Date().toLocaleTimeString() }
  ]);

  // Gerçek saat
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ping bilgisi - config değişince güncelle
  useEffect(() => {
    if (!config?.database?.host) return;
    fetchPing();
  }, [config]);

  const fetchPing = async () => {
    if (!ipcRenderer || !config?.database?.host) return;
    const result = await ipcRenderer.invoke('ping-server', config.database.host, config.database.port || 3306);
    setPingInfo({ ping: result.success ? result.ping : -1, ip: config.database.host });
  };

  const handleCheckUpdates = async () => {
    if (!ipcRenderer) return;
    setIsCheckingUpdates(true);
    try { await ipcRenderer.invoke('check-for-updates'); } catch {}
    setTimeout(() => setIsCheckingUpdates(false), 2000);
  };

  const removeNotification = (id) => setNotifications(p => p.filter(n => n.id !== id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-danger" />;
      default: return <Info className="w-4 h-4 text-vivid-blue" />;
    }
  };

  const statusColor = (s) => s === 'online' ? 'text-success' : s === 'warning' ? 'text-warning' : 'text-danger';
  const statusIcon = (s) => s === 'online'
    ? <Wifi className="w-4 h-4 text-success" />
    : s === 'warning'
      ? <AlertTriangle className="w-4 h-4 text-warning" />
      : <WifiOff className="w-4 h-4 text-danger" />;

  const allOk = serverStatus.game === 'online' && serverStatus.db === 'online';

  const winBtn = (action, icon, hoverColor) => (
    <button
      onClick={() => ipcRenderer && ipcRenderer.invoke(action)}
      className={`p-1.5 rounded transition-colors hover:${hoverColor} text-text-muted hover:text-white`}>
      {icon}
    </button>
  );

  return (
    <>
      <div className="bg-dark-surface border-b border-dark-border px-4 py-2 flex-shrink-0 select-none" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex items-center justify-between" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* Sol: Server Status */}
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-2">
              {statusIcon(serverStatus.game)}
              <div>
                <p className="text-xs text-text-muted">{t('game_server')}</p>
                <p className={`text-sm font-medium ${statusColor(serverStatus.game)}`}>
                  {serverStatus.game === 'online' ? t('online') : t('offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Database className={`w-4 h-4 ${statusColor(serverStatus.db)}`} />
              <div>
                <p className="text-xs text-text-muted">{t('database')}</p>
                <p className={`text-sm font-medium ${statusColor(serverStatus.db)}`}>
                  {serverStatus.db === 'online' ? t('online') : t('offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-vivid-blue" />
              <div>
                <p className="text-xs text-text-muted">{t('players_online')}</p>
                <p className="text-sm font-medium text-vivid-blue font-mono">{serverStatus.playerCount}</p>
              </div>
            </div>

            {/* Uptime yerine soru işareti + ping tooltip */}
            <div className="relative">
              <button
                onMouseEnter={() => { setShowPingTooltip(true); fetchPing(); }}
                onMouseLeave={() => setShowPingTooltip(false)}
                className="flex items-center space-x-1 p-1.5 rounded-lg hover:bg-dark-hover transition-colors">
                <HelpCircle className="w-4 h-4 text-text-muted" />
              </button>
              {showPingTooltip && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 p-3">
                  <p className="text-xs font-medium text-text-primary mb-2">Sunucu Bilgisi</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">IP / Host</span>
                      <span className="text-cyber-green font-mono">{pingInfo.ip || config?.database?.host || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Port</span>
                      <span className="text-text-primary font-mono">{config?.database?.port || 3306}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Ping</span>
                      <span className={`font-mono ${pingInfo.ping > 0 ? (pingInfo.ping < 50 ? 'text-success' : pingInfo.ping < 150 ? 'text-warning' : 'text-danger') : 'text-danger'}`}>
                        {pingInfo.ping > 0 ? `${pingInfo.ping}ms` : 'Timeout'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Database</span>
                      <span className="text-text-primary font-mono">{config?.database?.database || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Actions + Saat + Window Controls */}
          <div className="flex items-center space-x-2">
            <button onClick={handleCheckUpdates} disabled={isCheckingUpdates}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors" title={t('check_updates')}>
              <Download className={`w-4 h-4 text-text-secondary ${isCheckingUpdates ? 'animate-bounce' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                className="p-2 rounded-lg hover:bg-dark-hover transition-colors relative">
                <Bell className="w-4 h-4 text-text-secondary" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50">
                  <div className="flex items-center justify-between p-3 border-b border-dark-border">
                    <h3 className="font-medium text-text-primary text-sm">{t('notifications')}</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-dark-hover rounded">
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-dark-border hover:bg-dark-hover">
                        <div className="flex items-start space-x-2">
                          {getNotificationIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-text-primary truncate">{n.title}</p>
                              <button onClick={() => removeNotification(n.id)} className="p-0.5 hover:bg-dark-border rounded ml-1">
                                <X className="w-3 h-3 text-text-muted" />
                              </button>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                            <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center">
                        <Bell className="w-6 h-6 text-text-muted mx-auto mb-2" />
                        <p className="text-xs text-text-muted">{t('no_notifications')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => { setShowSettings(true); setShowNotifications(false); }}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors" title={t('settings')}>
              <Settings className="w-4 h-4 text-text-secondary" />
            </button>

            {/* Gerçek Saat */}
            <div className="text-sm font-mono text-text-primary bg-dark-hover px-3 py-1.5 rounded-lg border border-dark-border">
              {currentTime.toLocaleTimeString('tr-TR')}
            </div>

            {/* Durum */}
            <div className="flex items-center space-x-1.5 mr-2">
              <div className={`w-2 h-2 rounded-full ${allOk ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <span className="text-xs text-text-muted">{allOk ? t('all_systems_ok') : t('system_issues')}</span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center space-x-0.5 border-l border-dark-border pl-2">
              <button onClick={() => ipcRenderer && ipcRenderer.invoke('window-minimize')}
                className="p-1.5 rounded hover:bg-dark-hover transition-colors text-text-muted hover:text-text-primary">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => ipcRenderer && ipcRenderer.invoke('window-maximize')}
                className="p-1.5 rounded hover:bg-dark-hover transition-colors text-text-muted hover:text-text-primary">
                <Square className="w-3 h-3" />
              </button>
              <button onClick={() => ipcRenderer && ipcRenderer.invoke('window-close')}
                className="p-1.5 rounded hover:bg-red-500/80 transition-colors text-text-muted hover:text-white">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          config={config}
          onClose={() => setShowSettings(false)}
          onSave={(newConfig) => { onConfigUpdate(newConfig); setShowSettings(false); }}
        />
      )}
    </>
  );
}

export default TopBar;
