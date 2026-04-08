import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    if (!ipcRenderer) return;

    // Mevcut versiyonu al
    ipcRenderer.invoke('get-app-version').then(version => {
      setCurrentVersion(version);
    });

    // Güncelleme event'lerini dinle
    const handleDownloadProgress = (event, progress) => {
      setDownloadProgress(progress);
    };

    ipcRenderer.on('download-progress', handleDownloadProgress);

    return () => {
      ipcRenderer.removeListener('download-progress', handleDownloadProgress);
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

  if (!updateAvailable && !downloadProgress) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={checkForUpdates}
          className="flex items-center space-x-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg hover:border-cyber-green/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">Güncelleme Kontrol Et</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Download Progress */}
      {downloadProgress && (
        <div className="bg-dark-surface border border-cyber-green/30 rounded-lg p-4 min-w-80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-cyber-green animate-bounce" />
              <span className="text-sm font-medium text-text-primary">
                Güncelleme İndiriliyor
              </span>
            </div>
            <span className="text-xs text-text-muted">
              v{currentVersion}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-dark-hover rounded-full h-2 mb-2">
            <div
              className="bg-cyber-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>

          {/* Progress Info */}
          <div className="flex justify-between text-xs text-text-muted">
            <span>{Math.round(downloadProgress.percent)}%</span>
            <span>
              {Math.round(downloadProgress.bytesPerSecond / 1024)} KB/s
            </span>
          </div>

          <div className="text-xs text-text-muted mt-1">
            {Math.round(downloadProgress.transferred / 1024 / 1024)} MB / {Math.round(downloadProgress.total / 1024 / 1024)} MB
          </div>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && !downloadProgress && (
        <div className="bg-dark-surface border border-vivid-blue/30 rounded-lg p-4 min-w-80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-vivid-blue" />
              <span className="text-sm font-medium text-text-primary">
                Güncelleme Mevcut
              </span>
            </div>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="p-1 hover:bg-dark-hover rounded"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          <p className="text-xs text-text-muted mb-3">
            Yeni versiyon mevcut. İndirmek ister misiniz?
          </p>

          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded text-vivid-blue text-sm transition-colors">
              İndir
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="px-3 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded text-text-muted text-sm transition-colors"
            >
              Daha Sonra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateNotification;