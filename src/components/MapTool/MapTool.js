import React from 'react';
import { Map, Navigation, FileText, Zap } from 'lucide-react';

function MapTool() {
  return (
    <div className="h-full bg-dark-surface rounded-xl border border-dark-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-vivid-blue/10 rounded-lg border border-vivid-blue/20">
          <Map className="w-6 h-6 text-vivid-blue" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Map Tool</h1>
          <p className="text-text-muted">Harita koordinatları ve atlasinfo yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Map Visualization */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Map className="w-5 h-5 text-cyber-green" />
            <h2 className="text-lg font-medium text-text-primary">Harita Görselleştirme</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Koordinat işaretleme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Teleport noktaları</span>
            </div>
            <div className="flex items-center space-x-2">
              <Map className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Bölge sınırları</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              🗺️ Harita editörü yakında...
            </p>
          </div>
        </div>

        {/* AtlasInfo Manager */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-vivid-blue" />
            <h2 className="text-lg font-medium text-text-primary">AtlasInfo Yöneticisi</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">atlasinfo.txt editörü</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Otomatik koordinat güncelleme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Teleport kodu üretici</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              📝 AtlasInfo editörü yakında...
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-dark-hover rounded-lg border border-dark-border p-4">
        <h3 className="text-lg font-medium text-text-primary mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Koordinat Bul', desc: 'X,Y koordinatını haritada göster', icon: '🎯' },
            { name: 'Teleport Kodu', desc: 'Koordinat için teleport kodu üret', icon: '⚡' },
            { name: 'Bölge Ekle', desc: 'Yeni harita bölgesi tanımla', icon: '🗺️' },
            { name: 'Export', desc: 'AtlasInfo dosyasını dışa aktar', icon: '💾' }
          ].map((action, index) => (
            <div key={index} className="p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-vivid-blue/30 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">{action.icon}</div>
              <h4 className="text-sm font-medium text-text-primary">{action.name}</h4>
              <p className="text-xs text-text-muted">{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapTool;