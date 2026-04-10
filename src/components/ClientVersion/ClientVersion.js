import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, AlertCircle } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function ClientVersion() {
  const [versionInfo, setVersionInfo] = useState({
    current: '1.4.0',
    latest: '1.4.0',
    lastUpdate: new Date().toLocaleString('tr-TR'),
    status: 'updated', // updated, outdated, checking
    updateAvailable: false
  });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Uygulama açıldığında versiyon bilgisini al
    if (ipcRenderer) {
      ipcRenderer.invoke('get-app-version').then(version => {
        setVersionInfo(prev => ({
          ...prev,
          current: version
        }));
      });
    }

    // Güncelleme event'lerini dinle
    const handleUpdateAvailable = (event, info) => {
      setVersionInfo(prev => ({
        ...prev,
        latest: info.version,
        updateAvailable: true,
        status: 'outdated'
      }));
    };

    const handleUpdateNotAvailable = () => {
      setVersionInfo(prev => ({
        ...prev,
        status: 'updated'
      }));
    };

    if (ipcRenderer) {
      ipcRenderer.on('update-available', handleUpdateAvailable);
      ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
    }

    return () => {
      if (ipcRenderer) {
        ipcRenderer.removeListener('update-available', handleUpdateAvailable);
        ipcRenderer.removeListener('update-not-available', handleUpdateNotAvailable);
      }
    };
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setVersionInfo(prev => ({
      ...prev,
      status: 'checking'
    }));

    try {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('check-for-updates');
        if (result.success) {
          setVersionInfo(prev => ({
            ...prev,
            latest: result.remoteVersion,
            lastUpdate: new Date().toLocaleString('tr-TR'),
            updateAvailable: result.hasUpdate,
            status: result.hasUpdate ? 'outdated' : 'updated'
          }));
        }
      }
    } catch (err) {
      console.error('Update check error:', err);
      setVersionInfo(prev => ({
        ...prev,
        status: 'updated'
      }));
    }

    setChecking(false);
  };

  const getStatusColor = () => {
    switch (versionInfo.status) {
      case 'updated':
        return 'text-green-400';
      case 'outdated':
        return 'text-yellow-400';
      case 'checking':
        return 'text-blue-400';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = () => {
    switch (versionInfo.status) {
      case 'updated':
        return <CheckCircle className="w-4 h-4" />;
      case 'outdated':
        return <AlertCircle className="w-4 h-4" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (versionInfo.status) {
      case 'updated':
        return 'Güncel';
      case 'outdated':
        return 'Güncelleme Mevcut';
      case 'checking':
        return 'Kontrol Ediliyor...';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Client Version</h3>

      {/* Current Version */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Mevcut Sürüm:</span>
          <span className="text-text-primary font-mono font-bold text-lg">v{versionInfo.current}</span>
        </div>
      </div>

      {/* Latest Version */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Son Sürüm:</span>
          <span className={`font-mono font-bold text-lg ${versionInfo.updateAvailable ? 'text-yellow-400' : 'text-green-400'}`}>
            v{versionInfo.latest}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="bg-dark-hover rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Last Update */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-sm">Son Kontrol:</span>
          <span className="text-text-secondary text-xs font-mono">{versionInfo.lastUpdate}</span>
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheckUpdate}
        disabled={checking}
        className="w-full flex items-center justify-center space-x-2 bg-cyber-green/20 hover:bg-cyber-green/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-cyber-green disabled:text-gray-400 px-3 py-2 rounded-lg font-semibold transition-all"
      >
        <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        <span>{checking ? 'Kontrol Ediliyor...' : 'Güncelleme Kontrol Et'}</span>
      </button>

      {/* Update Available Notice */}
      {versionInfo.updateAvailable && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ Yeni sürüm mevcut! Sağ alt köşedeki bildirimi kontrol edin.
          </p>
        </div>
      )}
    </div>
  );
}

export default ClientVersion;
