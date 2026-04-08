import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Components
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';
import Dashboard from './components/Dashboard/Dashboard';
import ShopManager from './components/ShopManager/ShopManager';
import ProtoEditor from './components/ProtoEditor/ProtoEditor';
import QuestGenerator from './components/QuestGenerator/QuestGenerator';
import MapTool from './components/MapTool/MapTool';
import UITools from './components/UITools/UITools';
import LogAnalyzer from './components/LogAnalyzer/LogAnalyzer';

// Context
import { AppProvider } from './context/AppContext';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    game: 'offline',
    db: 'offline',
    playerCount: 0,
    uptime: '00:00:00'
  });

  useEffect(() => {
    // Simulated server status check
    const checkServerStatus = () => {
      // Bu kısım gerçek server status kontrolü için kullanılacak
      setServerStatus({
        game: Math.random() > 0.3 ? 'online' : 'offline',
        db: Math.random() > 0.2 ? 'online' : 'offline',
        playerCount: Math.floor(Math.random() * 150),
        uptime: '02:34:12'
      });
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <div className="flex h-screen bg-dark-bg text-text-primary">
            <Sidebar 
              collapsed={sidebarCollapsed} 
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar serverStatus={serverStatus} />
              
              <main className="flex-1 overflow-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/shop-manager" element={<ShopManager />} />
                  <Route path="/proto-editor" element={<ProtoEditor />} />
                  <Route path="/quest-generator" element={<QuestGenerator />} />
                  <Route path="/map-tool" element={<MapTool />} />
                  <Route path="/ui-tools" element={<UITools />} />
                  <Route path="/log-analyzer" element={<LogAnalyzer />} />
                </Routes>
              </main>
            </div>
            
            {/* Update Notification */}
            <UpdateNotification />
          </div>
        </Router>
      </DndProvider>
    </AppProvider>
  );
}

export default App;