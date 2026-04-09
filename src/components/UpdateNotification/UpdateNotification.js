import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [currentVersion, setCurrentVersion] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [hotReloadActive, setHotReloadActive] = useState(false);
  const [lastReloadTime, setLastReloadTime] = useState(null);

  useEffect(() => {
    if (!ipcRenderer) return;

    // Mevcut versiyonu al
    ipcRenderer.invoke('get-app-version').then(version => {
      setCurrentVersion(version);
    });

    // Güncelleme event'lerini dinle
    const handleUpdateAvailable = (event, info) => {
      console.log('[UPDATE] Yeni versiyon mevcut:', info);
      setUpdateInfo(info);
      setUpdateAvailable(true);
    };

    const handleDownloadProgress = (event, progress) => {
      setDownloadProgress(progress);
    };

    const handleUpdateDownloaded = () => {
      console.log('[UPDATE] İndirme tamamlandı');
      setDownloadProgress(null);
      setUpdateDownloaded(true);
    };

    const handleUpdateError = (event, error) => {
      console.error('[UPDATE] Hata:', error);
      setDownloadProgress(null);
    };

    // Hot reload event'lerini dinle (dev modunda)
    const handleFileChanged = (event, data) => {
      console.log('[HOT RELOAD] Dosya değişti:', data.path);
      setHotReloadActive(true);
      setLastReloadTime(new Date().toLocaleTimeString('tr-TR'));
      
      // 3 saniye sonra gösterimi kapat
      setTimeout(() => setHotReloadActive(false), 3000);
    };

    ipcRenderer.on('update-available', handleUpdateAvailable);
    ipcRenderer.on('download-progress', handleDownloadProgress);
    ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
    ipcRenderer.on('update-error', handleUpdateError);
    ipcRenderer.on('file-changed', handleFileChanged);

    return () => {
      ipcRenderer.removeListener('update-available', handleUpdateAvailable);
      ipcRenderer.removeListener('download-progress', handleDownloadProgress);
      ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
      ipcRenderer.removeListener('update-error', handleUpdateError);
      ipcRenderer.removeListener('file-changed', handleFileChanged);
    };
  }, []);

  const checkForUpdates = async () => {
    if (!ipcRenderer) return;
    
    try {
      const result = await ipcRenderer.invoke('check-for-updates');
      console.log('Update check result:', result);
    } catch (error) {
      console.error('Update check error:', error);
    }
  };

  const installUpdate = async () => {
    if (!ipcRenderer) return;
    
    try {
      await ipcRenderer.invoke('install-update');
    } catch (error) {
      console.error('Install update error:', error);
    }
  };

  // Hot reload göstergesi
  if (hotReloadActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-cyber-green/10 to-cyber-green/5 border border-cyber-green/50 rounded-xl p-4 flex items-center space-x-3 shadow-lg shadow-cyber-green/10 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-sm font-medium text-cyber-green">
              Değişiklikler yüklendi
            </span>
          </div>
          <span className="text-xs text-cyber-green/70 ml-2">
            {lastReloadTime}
          </span>
        </div>
      </div>
    );
  }

  // Update downloaded - restart butonu
  if (updateDownloaded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-cyber-green/10 to-dark-surface border border-cyber-green/50 rounded-xl p-5 min-w-96 shadow-2xl shadow-cyber-green/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-green/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-cyber-green" />
              </div>
              <div>
                <span className="text-sm font-bold text-text-primary block">
                  Güncelleme Hazır
                </span>
                <span className="text-xs text-text-muted">
                  v{updateInfo?.version}
                </span>
              </div>
            </div>
            <button
              onClick={() => setUpdateDownloaded(false)}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
            </button>
          </div>

          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Yeni versiyon indirildi ve yüklemeye hazır. Uygulamayı yeniden başlatmak için aşağıdaki butona tıklayın.
          </p>

          <button
            onClick={installUpdate}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyber-green/20 to-cyber-green/10 hover:from-cyber-green/30 hover:to-cyber-green/20 border border-cyber-green/50 rounded-lg text-cyber-green text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/20"
          >
            Şimdi Yeniden Başlat
          </button>
        </div>
      </div>
    );
  }

  // Download progress
  if (downloadProgress) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-cyber-green/10 to-dark-surface border border-cyber-green/30 rounded-xl p-5 min-w-96 shadow-2xl shadow-cyber-green/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyber-green/10 rounded-lg">
                <Download className="w-5 h-5 text-cyber-green animate-bounce" />
              </div>
              <div>
                <span className="text-sm font-bold text-text-primary block">
                  Güncelleme İndiriliyor
                </span>
                <span className="text-xs text-text-muted">
                  v{updateInfo?.version}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-dark-hover rounded-full h-2.5 overflow-hidden border border-cyber-green/20">
              <div
                className="bg-gradient-to-r from-cyber-green to-cyber-green/70 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-cyber-green/50"
                style={{ width: `${downloadProgress.percent}%` }}
              />
            </div>
          </div>

          {/* Progress Info */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-dark-hover/50 rounded-lg p-2 text-center">
              <div className="text-cyber-green font-bold">{Math.round(downloadProgress.percent)}%</div>
              <div className="text-text-muted text-xs">İlerleme</div>
            </div>
            <div className="bg-dark-hover/50 rounded-lg p-2 text-center">
              <div className="text-cyber-green font-bold">{Math.round(downloadProgress.bytesPerSecond / 1024)} KB/s</div>
              <div className="text-text-muted text-xs">Hız</div>
            </div>
            <div className="bg-dark-hover/50 rounded-lg p-2 text-center">
              <div className="text-cyber-green font-bold">{Math.round(downloadProgress.transferred / 1024 / 1024)}/{Math.round(downloadProgress.total / 1024 / 1024)} MB</div>
              <div className="text-text-muted text-xs">Boyut</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update available
  if (updateAvailable) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-vivid-blue/10 to-dark-surface border border-vivid-blue/30 rounded-xl p-5 min-w-96 shadow-2xl shadow-vivid-blue/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-vivid-blue/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-vivid-blue" />
              </div>
              <div>
                <span className="text-sm font-bold text-text-primary block">
                  Güncelleme Mevcut
                </span>
                <span className="text-xs text-text-muted">
                  v{updateInfo?.version}
                </span>
              </div>
            </div>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
            </button>
          </div>

          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Yeni versiyon mevcut. Güncellemeleri indirmek ve yüklemek ister misiniz?
          </p>

          <div className="flex gap-3">
            <button
              onClick={checkForUpdates}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-vivid-blue/20 to-vivid-blue/10 hover:from-vivid-blue/30 hover:to-vivid-blue/20 border border-vivid-blue/50 rounded-lg text-vivid-blue text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-vivid-blue/20"
            >
              İndir
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="px-4 py-2.5 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-text-muted text-sm font-medium transition-all duration-300"
            >
              Daha Sonra
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check button
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={checkForUpdates}
        className="group relative flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-dark-surface to-dark-hover border border-cyber-green/20 rounded-xl hover:border-cyber-green/60 transition-all duration-300 shadow-lg hover:shadow-cyber-green/20 hover:shadow-2xl"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-green/0 via-cyber-green/5 to-cyber-green/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-cyber-green group-hover:animate-spin transition-all" />
          <span className="text-sm font-medium text-text-secondary group-hover:text-cyber-green transition-colors duration-300">
            Güncelleme Kontrol Et
          </span>
        </div>

        {/* Hover indicator dot */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
      </button>
    </div>
  );
}

export default UpdateNotification;