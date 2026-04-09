import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, FileText, Scroll, Map, Palette, Activity, ChevronLeft, ChevronRight, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function Sidebar({ collapsed, onToggle }) {
  const { t } = useLanguage();
  const [updateStatus, setUpdateStatus] = useState('checking'); // checking, current, available, downloading, ready
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [latestVersion, setLatestVersion] = useState('1.0.0');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!ipcRenderer) return;

    // Mevcut versiyonu al
    ipcRenderer.invoke('get-app-version').then(version => {
      setCurrentVersion(version);
    });

    // Güncelleme event'lerini dinle
    const handleUpdateAvailable = (event, info) => {
      console.log('[SIDEBAR] Yeni versiyon mevcut:', info);
      setLatestVersion(info.version);
      setUpdateStatus('available');
    };

    const handleDownloadProgress = (event, progress) => {
      setDownloadProgress(progress.percent);
      setUpdateStatus('downloading');
    };

    const handleUpdateDownloaded = () => {
      console.log('[SIDEBAR] İndirme tamamlandı');
      setUpdateStatus('ready');
    };

    const handleUpdateError = (event, error) => {
      console.error('[SIDEBAR] Hata:', error);
      setUpdateStatus('current');
    };

    ipcRenderer.on('update-available', handleUpdateAvailable);
    ipcRenderer.on('download-progress', handleDownloadProgress);
    ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
    ipcRenderer.on('update-error', handleUpdateError);

    // Başlangıçta kontrol et
    checkUpdates();

    return () => {
      ipcRenderer.removeListener('update-available', handleUpdateAvailable);
      ipcRenderer.removeListener('download-progress', handleDownloadProgress);
      ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
      ipcRenderer.removeListener('update-error', handleUpdateError);
    };
  }, []);

  const checkUpdates = async () => {
    if (!ipcRenderer) return;
    setUpdateStatus('checking');
    try {
      await ipcRenderer.invoke('check-for-updates');
      // Eğer güncelleme yoksa 2 saniye sonra "current" göster
      setTimeout(() => {
        if (updateStatus === 'checking') {
          setUpdateStatus('current');
        }
      }, 2000);
    } catch (error) {
      console.error('[SIDEBAR] Kontrol hatası:', error);
      setUpdateStatus('current');
    }
  };

  const handleInstallUpdate = async () => {
    if (!ipcRenderer) return;
    try {
      await ipcRenderer.invoke('install-update');
    } catch (error) {
      console.error('[SIDEBAR] Yükleme hatası:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: Home, labelKey: 'dashboard' },
    { path: '/shop-manager', icon: ShoppingCart, labelKey: 'shop_manager' },
    { path: '/proto-editor', icon: FileText, labelKey: 'proto_editor' },
    { path: '/quest-generator', icon: Scroll, labelKey: 'quest_generator' },
    { path: '/map-tool', icon: Map, labelKey: 'map_tool' },
    { path: '/ui-tools', icon: Palette, labelKey: 'ui_tools' },
    { path: '/log-analyzer', icon: Activity, labelKey: 'log_analyzer' }
  ];

  return (
    <div className={`bg-dark-surface border-r border-dark-border transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-green to-vivid-blue rounded-lg flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">M2</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">Metin2 Dev</h1>
              <p className="text-xs text-text-muted">Toolkit v1.0</p>
            </div>
          </div>
        )}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4 text-text-secondary" /> : <ChevronLeft className="w-4 h-4 text-text-secondary" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 flex-1">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-dark-hover border border-cyber-green/30 text-cyber-green'
                  : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
              }`
            }>
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-cyber-green' : 'text-text-secondary group-hover:text-text-primary'}`} />
                {!collapsed && <span className="font-medium text-sm">{t(item.labelKey)}</span>}
                {isActive && !collapsed && <div className="ml-auto w-2 h-2 bg-cyber-green rounded-full animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* INFO Panel - Güncelleme Durumu */}
      <div className="p-3 border-t border-dark-border">
        {collapsed ? (
          // Collapsed Mode - Sadece Icon
          <button
            onClick={checkUpdates}
            className="w-full p-2 rounded-lg hover:bg-dark-hover transition-colors"
            title="Güncelleme Kontrol Et"
          >
            {updateStatus === 'checking' && <RefreshCw className="w-5 h-5 text-vivid-blue animate-spin mx-auto" />}
            {updateStatus === 'current' && <CheckCircle className="w-5 h-5 text-success mx-auto" />}
            {updateStatus === 'available' && <AlertCircle className="w-5 h-5 text-warning mx-auto animate-pulse" />}
            {updateStatus === 'downloading' && <Download className="w-5 h-5 text-cyber-green animate-bounce mx-auto" />}
            {updateStatus === 'ready' && <CheckCircle className="w-5 h-5 text-cyber-green mx-auto animate-pulse" />}
          </button>
        ) : (
          // Expanded Mode - Full Panel
          <div className="bg-dark-hover rounded-lg p-3 border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">📊 Güncelleme</h3>
              <button
                onClick={checkUpdates}
                disabled={updateStatus === 'checking'}
                className="p-1 hover:bg-dark-border rounded transition-colors"
                title="Kontrol Et"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-text-muted hover:text-cyber-green transition-colors ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Versiyon Bilgisi */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Mevcut:</span>
                <span className="font-mono text-text-primary font-semibold">v{currentVersion}</span>
              </div>

              {/* Durum Göstergesi */}
              <div className="pt-2 border-t border-dark-border">
                {updateStatus === 'checking' && (
                  <div className="flex items-center space-x-2 text-vivid-blue">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Kontrol ediliyor...</span>
                  </div>
                )}

                {updateStatus === 'current' && (
                  <div className="flex items-center space-x-2 text-success">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>✅ Güncel</span>
                  </div>
                )}

                {updateStatus === 'available' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-warning animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>⚠️ Güncelleme Mevcut</span>
                    </div>
                    <div className="flex justify-between items-center text-text-muted">
                      <span>Yeni:</span>
                      <span className="font-mono text-cyber-green font-semibold">v{latestVersion}</span>
                    </div>
                    <button
                      onClick={checkUpdates}
                      className="w-full mt-2 px-2 py-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/50 rounded text-cyber-green text-xs font-semibold transition-all"
                    >
                      İndir
                    </button>
                  </div>
                )}

                {updateStatus === 'downloading' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-cyber-green">
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                      <span>🔄 İndiriliyor...</span>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyber-green to-cyber-green/70 h-1.5 transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <div className="text-right text-text-muted">{Math.round(downloadProgress)}%</div>
                  </div>
                )}

                {updateStatus === 'ready' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-cyber-green animate-pulse">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>✨ Hazır</span>
                    </div>
                    <button
                      onClick={handleInstallUpdate}
                      className="w-full px-2 py-1.5 bg-cyber-green/20 hover:bg-cyber-green/30 border border-cyber-green/50 rounded text-cyber-green text-xs font-semibold transition-all"
                    >
                      Yeniden Başlat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
