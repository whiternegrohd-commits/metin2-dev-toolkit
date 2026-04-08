import React, { useState } from 'react';
import { Eye, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

function NPCPreview({ npcVnum, npcName }) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Mock NPC model data - gerçek uygulamada 3D model renderer olacak
  const getNPCModel = (vnum) => {
    const models = {
      9001: '🧙‍♂️', // Silahçı
      9002: '👨‍🔧', // Zırhçı
      9003: '🧝‍♀️', // Büyücü
    };
    return models[vnum] || '👤';
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setRotation(0);
    setZoom(1);
  };

  return (
    <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">NPC Önizleme</h3>
          <p className="text-xs text-text-muted">{npcName} (#{npcVnum})</p>
        </div>
        <Eye className="w-4 h-4 text-vivid-blue" />
      </div>

      {/* 3D Preview Area */}
      <div className="relative bg-gradient-to-b from-dark-hover to-dark-bg rounded-lg border border-dark-border h-48 mb-4 overflow-hidden">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,127,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,127,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* NPC Model */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-6xl transition-all duration-300 filter drop-shadow-lg"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
            }}
          >
            {getNPCModel(npcVnum)}
          </div>
        </div>

        {/* Lighting Effect */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-cyber-green/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-vivid-blue/10 rounded-full blur-2xl" />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleRotate}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-dark-hover hover:bg-dark-border rounded-lg border border-dark-border transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">Döndür</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-dark-hover hover:bg-dark-border rounded-lg border border-dark-border transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">Sıfırla</span>
        </button>

        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-dark-hover hover:bg-dark-border rounded-lg border border-dark-border transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">Yaklaş</span>
        </button>

        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-dark-hover hover:bg-dark-border rounded-lg border border-dark-border transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary">Uzaklaş</span>
        </button>
      </div>

      {/* NPC Stats */}
      <div className="mt-4 p-3 bg-dark-hover rounded-lg border border-dark-border">
        <h4 className="text-xs font-medium text-text-primary mb-2">NPC Bilgileri</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Vnum:</span>
            <span className="text-text-primary font-mono">{npcVnum}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Tür:</span>
            <span className="text-text-primary">Dükkan NPC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Zoom:</span>
            <span className="text-text-primary font-mono">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Rotasyon:</span>
            <span className="text-text-primary font-mono">{rotation}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NPCPreview;