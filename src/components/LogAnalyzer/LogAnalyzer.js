import React from 'react';
import { Activity, AlertTriangle, Info, X, Play, Pause } from 'lucide-react';

function LogAnalyzer() {
  return (
    <div className="h-full bg-dark-surface rounded-xl border border-dark-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
          <Activity className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Log Analyzer</h1>
          <p className="text-text-muted">Syslog ve syserr dosyalarını anlık takip et</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Log Stream */}
        <div className="lg:col-span-2 bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-medium text-text-primary">Canlı Log Akışı</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-cyber-green/10 hover:bg-cyber-green/20 rounded-lg border border-cyber-green/30 transition-colors">
                <Play className="w-4 h-4 text-cyber-green" />
              </button>
              <button className="p-2 bg-danger/10 hover:bg-danger/20 rounded-lg border border-danger/30 transition-colors">
                <Pause className="w-4 h-4 text-danger" />
              </button>
            </div>
          </div>
          
          <div className="bg-dark-surface rounded-lg border border-dark-border p-4 h-96 overflow-y-auto font-mono text-sm">
            {/* Mock log entries */}
            {[
              { time: '14:32:15', level: 'INFO', message: 'Player [TestUser] connected from 192.168.1.100', type: 'info' },
              { time: '14:32:18', level: 'WARNING', message: 'High CPU usage detected: 85%', type: 'warning' },
              { time: '14:32:22', level: 'ERROR', message: 'Database connection timeout', type: 'error' },
              { time: '14:32:25', level: 'INFO', message: 'Quest completed: Dragon Valley Mission', type: 'info' },
              { time: '14:32:28', level: 'CRITICAL', message: 'Memory leak detected in channel 1', type: 'critical' },
              { time: '14:32:30', level: 'INFO', message: 'Player [TestUser] disconnected', type: 'info' }
            ].map((log, index) => (
              <div key={index} className={`flex items-start space-x-3 py-1 ${
                log.type === 'error' || log.type === 'critical' ? 'bg-danger/10' :
                log.type === 'warning' ? 'bg-warning/10' : ''
              }`}>
                <span className="text-text-muted">{log.time}</span>
                <span className={`font-medium ${
                  log.type === 'error' || log.type === 'critical' ? 'text-danger' :
                  log.type === 'warning' ? 'text-warning' :
                  'text-cyber-green'
                }`}>
                  [{log.level}]
                </span>
                <span className="text-text-primary flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Log Statistics */}
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
            <h3 className="text-lg font-medium text-text-primary mb-4">İstatistikler</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyber-green rounded-full" />
                  <span className="text-sm text-text-muted">Info</span>
                </div>
                <span className="text-sm text-text-primary font-mono">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full" />
                  <span className="text-sm text-text-muted">Warning</span>
                </div>
                <span className="text-sm text-text-primary font-mono">23</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-danger rounded-full" />
                  <span className="text-sm text-text-muted">Error</span>
                </div>
                <span className="text-sm text-text-primary font-mono">5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full" />
                  <span className="text-sm text-text-muted">Critical</span>
                </div>
                <span className="text-sm text-text-primary font-mono">1</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
            <h3 className="text-lg font-medium text-text-primary mb-4">Filtreler</h3>
            <div className="space-y-3">
              {['INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((level) => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-dark-border bg-dark-surface text-cyber-green focus:ring-cyber-green"
                  />
                  <span className="text-sm text-text-muted">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recent Errors */}
          <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
            <h3 className="text-lg font-medium text-text-primary mb-4">Son Hatalar</h3>
            <div className="space-y-2">
              {[
                { time: '14:32:28', message: 'Memory leak detected', type: 'critical' },
                { time: '14:32:22', message: 'DB connection timeout', type: 'error' },
                { time: '14:31:45', message: 'High CPU usage', type: 'warning' }
              ].map((error, index) => (
                <div key={index} className="p-2 bg-dark-surface rounded border border-dark-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted font-mono">{error.time}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      error.type === 'critical' ? 'bg-purple-400' :
                      error.type === 'error' ? 'bg-danger' : 'bg-warning'
                    }`} />
                  </div>
                  <p className="text-xs text-text-primary">{error.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogAnalyzer;