import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Users, 
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  Bell,
  Download
} from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function TopBar({ serverStatus }) {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const handleCheckUpdates = async () => {
    if (!ipcRenderer) return;
    
    setIsCheckingUpdates(true);
    try {
      const result = await ipcRenderer.invoke('check-for-updates');
      console.log('Update check:', result);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setTimeout(() => setIsCheckingUpdates(false), 2000);
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-success" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-danger" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <WifiOff className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className="bg-dark-surface border-b border-dark-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Server Status Indicators */}
        <div className="flex items-center space-x-6">
          {/* Game Server Status */}
          <div className="flex items-center space-x-2">
            {getStatusIcon(serverStatus.game)}
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">Game Server</span>
              <span className={`text-sm font-medium ${getStatusColor(serverStatus.game)}`}>
                {serverStatus.game.charAt(0).toUpperCase() + serverStatus.game.slice(1)}
              </span>
            </div>
          </div>

          {/* Database Status */}
          <div className="flex items-center space-x-2">
            <Database className={`w-4 h-4 ${getStatusColor(serverStatus.db)}`} />
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">Database</span>
              <span className={`text-sm font-medium ${getStatusColor(serverStatus.db)}`}>
                {serverStatus.db.charAt(0).toUpperCase() + serverStatus.db.slice(1)}
              </span>
            </div>
          </div>

          {/* Player Count */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-vivid-blue" />
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">Players Online</span>
              <span className="text-sm font-medium text-vivid-blue">
                {serverStatus.playerCount}
              </span>
            </div>
          </div>

          {/* Uptime */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyber-green" />
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">Uptime</span>
              <span className="text-sm font-medium text-cyber-green font-mono">
                {serverStatus.uptime}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors relative"
              title="Güncelleme Kontrol Et"
            >
              <Download className={`w-4 h-4 text-text-secondary ${isCheckingUpdates ? 'animate-bounce' : ''}`} />
            </button>
            
            <button className="p-2 rounded-lg hover:bg-dark-hover transition-colors relative">
              <Bell className="w-4 h-4 text-text-secondary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </button>
            
            <button className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
              <Settings className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Current Time */}
          <div className="text-sm text-text-muted font-mono">
            {new Date().toLocaleTimeString('tr-TR')}
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus.game === 'online' && serverStatus.db === 'online'
                ? 'bg-success animate-pulse'
                : 'bg-danger'
            }`} />
            <span className="text-xs text-text-muted">
              {serverStatus.game === 'online' && serverStatus.db === 'online'
                ? 'All Systems Operational'
                : 'System Issues Detected'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;