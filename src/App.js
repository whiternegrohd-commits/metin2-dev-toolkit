import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';
import ErrorBoundary from './components/ErrorBoundary';
import SetupWizard from './components/Setup/SetupWizard';
import Dashboard from './components/Dashboard/Dashboard';
import ShopManager from './components/ShopManager/ShopManagerSimple';
import ProtoEditor from './components/ProtoEditor/ProtoEditor';
import QuestGenerator from './components/QuestGenerator/QuestGenerator';
import MapTool from './components/MapTool/MapTool';
import UITools from './components/UITools/UITools';
import LogAnalyzer from './components/LogAnalyzer/LogAnalyzer';

import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Database from './utils/database';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [appConfig, setAppConfig] = useState(null);
  const [serverStatus, setServerStatus] = useState({
    game: 'offline',
    db: 'offline',
    playerCount: 0,
    uptime: '00:00:00'
  });
  const [hotReloadKey, setHotReloadKey] = useState(0);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  // Hot reload listener
  useEffect(() => {
    if (!ipcRenderer) return;

    const handleFileChanged = (event, data) => {
      console.log('[HOT RELOAD] Dosya değişti, component yeniden render ediliyor:', data.path);
      // Component'i yeniden render et
      setHotReloadKey(prev => prev + 1);
    };

    ipcRenderer.on('file-changed', handleFileChanged);

    return () => {
      ipcRenderer.removeListener('file-changed', handleFileChanged);
    };
  }, []);

  const checkSetupStatus = async () => {
    try {
      if (ipcRenderer) {
        const config = await ipcRenderer.invoke('get-config');
        if (config && config.database) {
          setAppConfig(config);
          Database.setConfig(config.database);
          setAppReady(true);
        } else {
          setShowSetup(true);
        }
      } else {
        const savedConfig = localStorage.getItem('metin2-config');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setAppConfig(parsed);
          Database.setConfig(parsed.database);
          setAppReady(true);
        } else {
          setShowSetup(true);
        }
      }
    } catch {
      setShowSetup(true);
    }
  };

  const handleSetupComplete = (config) => {
    setAppConfig(config);
    Database.setConfig(config.database);
    setShowSetup(false);
    setAppReady(true);
  };

  // Gerçek server status - her 15 saniyede güncelle
  const fetchServerStatus = useCallback(async () => {
    if (!appConfig?.database) return;

    let dbOnline = false;
    let playerCount = 0;
    let ftpOnline = false;

    if (ipcRenderer) {
      // DB + player count
      try {
        const stats = await ipcRenderer.invoke('get-server-stats', appConfig.database);
        dbOnline = stats.dbOnline === true;
        playerCount = stats.playerCount || 0;
      } catch {}

      // FTP ping (eğer config varsa)
      if (appConfig?.ftp?.host) {
        try {
          const ftp = await ipcRenderer.invoke('ping-server', appConfig.ftp.host, appConfig.ftp.port || 21);
          ftpOnline = ftp.success;
        } catch {}
      }
    }

    setServerStatus({
      game: (dbOnline || ftpOnline) ? 'online' : 'offline',
      db: dbOnline ? 'online' : 'offline',
      playerCount,
      uptime: '00:00:00'
    });
  }, [appConfig]);

  useEffect(() => {
    if (!appReady) return;
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, [appReady, fetchServerStatus]);

  const handleConfigUpdate = (newConfig) => {
    setAppConfig(newConfig);
    Database.setConfig(newConfig.database);
    if (ipcRenderer) {
      ipcRenderer.invoke('save-config', newConfig);
    } else {
      localStorage.setItem('metin2-config', JSON.stringify(newConfig));
    }
  };

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <AppProvider>
          <DndProvider backend={HTML5Backend}>
            <Router key={hotReloadKey}>
              {/* Setup zorunlu - tamamlanmadan uygulama görünmez */}
              {showSetup && (
                <SetupWizard onComplete={handleSetupComplete} />
              )}

              {appReady && (
                <div className="flex h-screen bg-dark-bg text-text-primary overflow-hidden">
                  <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                  />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                      serverStatus={serverStatus}
                      config={appConfig}
                      onConfigUpdate={handleConfigUpdate}
                    />
                    <main className="flex-1 overflow-auto">
                      <div className="p-6">
                        <ErrorBoundary>
                          <Routes>
                            <Route path="/" element={<Dashboard config={appConfig} />} />
                            <Route path="/shop-manager" element={<ShopManager config={appConfig} />} />
                            <Route path="/proto-editor" element={<ProtoEditor config={appConfig} />} />
                            <Route path="/quest-generator" element={<QuestGenerator config={appConfig} />} />
                            <Route path="/map-tool" element={<MapTool config={appConfig} />} />
                            <Route path="/ui-tools" element={<UITools config={appConfig} />} />
                            <Route path="/log-analyzer" element={<LogAnalyzer config={appConfig} />} />
                          </Routes>
                        </ErrorBoundary>
                      </div>
                    </main>
                  </div>
                  <UpdateNotification />
                </div>
              )}
            </Router>
          </DndProvider>
        </AppProvider>
      </ErrorBoundary>
    </LanguageProvider>
  );
}

export default App;
