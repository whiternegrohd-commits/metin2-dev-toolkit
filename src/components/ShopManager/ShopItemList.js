import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Search, Filter, Package, Coins, Star } from 'lucide-react';

// Draggable Item Component
function DraggableItem({ item, onDrag }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    begin: () => onDrag(item)
  });

  const getItemIcon = (type) => {
    const icons = {
      weapon: '⚔️',
      armor: '🛡️',
      accessory: '💍',
      consumable: '🧪',
      etc: '📦'
    };
    return icons[type] || '📦';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-text-muted',
      uncommon: 'text-cyber-green',
      rare: 'text-vivid-blue',
      epic: 'text-purple-400',
      legendary: 'text-warning'
    };
    return colors[rarity] || 'text-text-muted';
  };

  return (
    <div
      ref={drag}
      className={`
        p-3 bg-dark-hover rounded-lg border border-dark-border cursor-grab active:cursor-grabbing
        hover:border-cyber-green/30 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-102'}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">
          {getItemIcon(item.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-medium truncate ${getRarityColor(item.rarity)}`}>
              {item.name}
            </h4>
            {item.rarity !== 'common' && (
              <Star className={`w-3 h-3 ${getRarityColor(item.rarity)}`} />
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-text-muted">Vnum:</span>
              <span className="text-xs text-text-primary font-mono">{item.vnum}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Coins className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning font-mono">
                {item.defaultPrice?.toLocaleString() || '1,000'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopItemList({ onItemDrag }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  // Mock item data - gerçek uygulamada database'den gelecek
  useEffect(() => {
    const mockItems = [
      {
        vnum: 10,
        name: 'Kılıç +0',
        type: 'weapon',
        rarity: 'common',
        defaultPrice: 1000,
        level: 1
      },
      {
        vnum: 20,
        name: 'Hançer +0',
        type: 'weapon',
        rarity: 'common',
        defaultPrice: 800,
        level: 1
      },
      {
        vnum: 30,
        name: 'Yay +0',
        type: 'weapon',
        rarity: 'uncommon',
        defaultPrice: 1200,
        level: 1
      },
      {
        vnum: 11001,
        name: 'Zırh +0',
        type: 'armor',
        rarity: 'common',
        defaultPrice: 2000,
        level: 1
      },
      {
        vnum: 11002,
        name: 'Gömlek +0',
        type: 'armor',
        rarity: 'common',
        defaultPrice: 1500,
        level: 1
      },
      {
        vnum: 12001,
        name: 'Güç Yüzüğü',
        type: 'accessory',
        rarity: 'rare',
        defaultPrice: 5000,
        level: 10
      },
      {
        vnum: 27001,
        name: 'Kırmızı İksir',
        type: 'consumable',
        rarity: 'common',
        defaultPrice: 50,
        level: 1
      },
      {
        vnum: 50001,
        name: 'Ejder Taşı',
        type: 'etc',
        rarity: 'legendary',
        defaultPrice: 100000,
        level: 50
      }
    ];
    setItems(mockItems);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vnum.toString().includes(searchTerm);
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    
    return matchesSearch && matchesType && matchesRarity;
  });

  return (
    <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-vivid-blue" />
          <h3 className="text-sm font-semibold text-text-primary">Item Listesi</h3>
        </div>
        <div className="text-xs text-text-muted">
          {filteredItems.length} item
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Item ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-sm"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-xs focus:border-cyber-green focus:outline-none"
        >
          <option value="all">Tüm Türler</option>
          <option value="weapon">Silah</option>
          <option value="armor">Zırh</option>
          <option value="accessory">Aksesuar</option>
          <option value="consumable">Tüketim</option>
          <option value="etc">Diğer</option>
        </select>

        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-xs focus:border-cyber-green focus:outline-none"
        >
          <option value="all">Tüm Nadirlikler</option>
          <option value="common">Sıradan</option>
          <option value="uncommon">Nadir</option>
          <option value="rare">Ender</option>
          <option value="epic">Epik</option>
          <option value="legendary">Efsanevi</option>
        </select>
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredItems.map(item => (
          <DraggableItem
            key={item.vnum}
            item={item}
            onDrag={onItemDrag}
          />
        ))}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">Hiç item bulunamadı</p>
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      <div className="mt-4 p-3 bg-dark-hover rounded-lg border border-dark-border">
        <p className="text-xs text-text-muted text-center">
          💡 İtemleri sürükleyip dükkan slotlarına bırakın
        </p>
      </div>
    </div>
  );
}

export default ShopItemList;