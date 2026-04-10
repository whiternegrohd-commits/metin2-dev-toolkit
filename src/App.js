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
import ServerManager from './components/ServerManager/ServerManager';
import PlayerList from './components/Players/PlayerList';
import QuestEditor from './components/Quests/QuestEditor';
import QueryBuilder from './components/QueryBuilder/QueryBuilder';

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

  useEffect(() => {
    checkSetupStatus();
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

  const fetchServerStatus = useCallback(async () => {
    if (!appConfig?.database) return;

    let dbOnline = false;
    let playerCount = 0;

    if (ipcRenderer) {
      try {
        const stats = await ipcRenderer.invoke('get-server-stats', appConfig.database);
        dbOnline = stats.dbOnline === true;
        playerCount = stats.playerCount || 0;
      } catch {}
    }

    setServerStatus({
      game: dbOnline ? 'online' : 'offline',
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
            <Router>
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
                            <Route path="/server-manager" element={<ServerManager config={appConfig} />} />
                            <Route path="/players" element={<PlayerList config={appConfig} />} />
                            <Route path="/quests" element={<QuestEditor config={appConfig} />} />
                            <Route path="/query-builder" element={<QueryBuilder config={appConfig} />} />
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
