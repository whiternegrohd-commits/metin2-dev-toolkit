import React from 'react';
import { Scroll, Code, FileCode } from 'lucide-react';

function QuestGenerator() {
  return (
    <div className="h-full bg-dark-surface rounded-xl border border-dark-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
          <Scroll className="w-6 h-6 text-cyber-green" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Quest Generator</h1>
          <p className="text-text-muted">Görsel blok editörü ile Lua quest yazımı</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Visual Scripting */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-cyber-green" />
            <h2 className="text-lg font-medium text-text-primary">Visual Scripting</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyber-green rounded-full" />
              <span className="text-sm text-text-muted">Sürükle-bırak blok sistemi</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-vivid-blue rounded-full" />
              <span className="text-sm text-text-muted">NPC konuşma editörü</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full" />
              <span className="text-sm text-text-muted">Koşul ve aksiyon blokları</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              🎨 Visual Editor yakında...
            </p>
          </div>
        </div>

        {/* Lua Code Editor */}
        <div className="bg-dark-hover rounded-lg border border-dark-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Code className="w-5 h-5 text-vivid-blue" />
            <h2 className="text-lg font-medium text-text-primary">Lua Editor</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Syntax highlighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Auto-completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <Scroll className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Hazır quest şablonları</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-center text-text-muted">
              💻 Code Editor yakında...
            </p>
          </div>
        </div>
      </div>

      {/* Quest Templates */}
      <div className="mt-6 bg-dark-hover rounded-lg border border-dark-border p-4">
        <h3 className="text-lg font-medium text-text-primary mb-4">Hazır Quest Şablonları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Kill Quest', desc: 'Belirli mob öldürme görevi', icon: '⚔️' },
            { name: 'Delivery Quest', desc: 'Eşya teslim etme görevi', icon: '📦' },
            { name: 'Collection Quest', desc: 'Item toplama görevi', icon: '🎒' }
          ].map((template, index) => (
            <div key={index} className="p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-cyber-green/30 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">{template.icon}</div>
              <h4 className="text-sm font-medium text-text-primary">{template.name}</h4>
              <p className="text-xs text-text-muted">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestGenerator;