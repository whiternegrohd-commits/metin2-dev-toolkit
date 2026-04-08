import React from 'react';
import { Palette, Scissors, Eye, Code } from 'lucide-react';

function UITools() {
  return (
    <div className="h-full bg-dark-surface rounded-xl border border-dark-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
          <Palette className="w-6 h-6 text-cyber-green" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">UI Tools</h1>
          <p className="text-text-muted">Sub dosyaları ve UI scriptlerini düzenle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Sub Slicer */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Scissors className="w-5 h-5 text-cyber-green" />
            <h2 className="text-lg font-medium text-text-primary">Sub Slicer</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">.sub dosya parçalayıcı</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Görsel önizleme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Renk paleti editörü</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              ✂️ Sub Slicer yakında...
            </p>
          </div>
        </div>

        {/* UIScript Editor */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-vivid-blue" />
            <h2 className="text-lg font-medium text-text-primary">UIScript Editor</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Python syntax highlighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Canlı önizleme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">UI element editörü</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              🖥️ UIScript editörü yakında...
            </p>
          </div>
        </div>
      </div>

      {/* UI Components */}
      <div className="mt-6 bg-dark-hover rounded-lg border border-dark-border p-4">
        <h3 className="text-lg font-medium text-text-primary mb-4">UI Bileşenleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Window', desc: 'Pencere bileşeni editörü', icon: '🪟' },
            { name: 'Button', desc: 'Buton tasarım editörü', icon: '🔘' },
            { name: 'Inventory', desc: 'Envanter arayüzü editörü', icon: '🎒' },
            { name: 'Dialog', desc: 'Dialog penceresi editörü', icon: '💬' },
            { name: 'Shop', desc: 'Dükkan arayüzü editörü', icon: '🏪' },
            { name: 'Character', desc: 'Karakter paneli editörü', icon: '👤' }
          ].map((component, index) => (
            <div key={index} className="p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-cyber-green/30 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">{component.icon}</div>
              <h4 className="text-sm font-medium text-text-primary">{component.name}</h4>
              <p className="text-xs text-text-muted">{component.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UITools;