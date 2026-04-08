import React from 'react';
import { FileText, Database, Filter, Edit3 } from 'lucide-react';

function ProtoEditor() {
  return (
    <div className="h-full bg-dark-surface rounded-xl border border-dark-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-vivid-blue/10 rounded-lg border border-vivid-blue/20">
          <FileText className="w-6 h-6 text-vivid-blue" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Proto Editor</h1>
          <p className="text-text-muted">Item ve Mob proto dosyalarını düzenle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Item Proto */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-cyber-green" />
            <h2 className="text-lg font-medium text-text-primary">Item Proto</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Gelişmiş filtreleme sistemi</span>
            </div>
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Toplu düzenleme desteği</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">SQL/Client senkronizasyonu</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              🚧 Geliştirme aşamasında...
            </p>
          </div>
        </div>

        {/* Mob Proto */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-vivid-blue" />
            <h2 className="text-lg font-medium text-text-primary">Mob Proto</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Mob istatistik editörü</span>
            </div>
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Drop tablosu yönetimi</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">AI davranış editörü</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              🚧 Geliştirme aşamasında...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProtoEditor;