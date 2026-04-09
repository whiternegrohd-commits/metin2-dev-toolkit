import React from 'react';
import { useDrop } from 'react-dnd';
import { X, Coins } from 'lucide-react';

function ItemSlot({ slot, item, onRemove }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'item',
    drop: () => ({ slot }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [slot]);

  const getItemIcon = (vnum) => {
    // Mock item icon mapping - gerçek uygulamada item database'inden gelecek
    const iconMap = {
      10: '⚔️', 20: '🗡️', 30: '🏹',
      11001: '🛡️', 11002: '👕'
    };
    return iconMap[vnum] || '📦';
  };

  const getItemName = (vnum) => {
    // Mock item name mapping
    const nameMap = {
      10: 'Kılıç +0', 20: 'Hançer +0', 30: 'Yay +0',
      11001: 'Zırh +0', 11002: 'Gömlek +0'
    };
    return nameMap[vnum] || `Item #${vnum}`;
  };

  return (
    <div
      ref={drop}
      className={`
        relative aspect-square border-2 rounded-lg transition-all duration-200
        ${isOver && canDrop 
          ? 'border-cyber-green bg-cyber-green/10 scale-105' 
          : 'border-dark-border hover:border-dark-hover'
        }
        ${item ? 'bg-dark-hover' : 'bg-dark-surface'}
      `}
    >
      {/* Slot Number */}
      <div className="absolute top-1 left-1 text-xs text-text-muted font-mono">
        {slot}
      </div>

      {/* Item Content */}
      {item ? (
        <div className="h-full flex flex-col items-center justify-center p-2 group">
          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-danger/80 hover:bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          {/* Item Icon */}
          <div className="text-2xl mb-1">
            {getItemIcon(item.vnum)}
          </div>

          {/* Item Info */}
          <div className="text-center">
            <div className="text-xs text-text-primary font-medium truncate w-full">
              {getItemName(item.vnum)}
            </div>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Coins className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning font-mono">
                {item.price.toLocaleString()}
              </span>
            </div>
            {item.count > 1 && (
              <div className="text-xs text-vivid-blue">
                x{item.count}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-text-muted text-xs text-center">
            {isOver && canDrop ? (
              <div className="text-cyber-green">
                Bırak
              </div>
            ) : (
              <div>
                Boş
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Effect */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-cyber-green/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
}

export default ItemSlot;