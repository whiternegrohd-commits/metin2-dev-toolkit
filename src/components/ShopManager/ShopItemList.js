import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Search, Filter, Package, Coins, Star } from 'lucide-react';
import Database from '../../utils/database';

// Draggable Item Component
function DraggableItem({ item, onDrag }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'item',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: () => onDrag(item)
  }), [item, onDrag]);

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

  // Database'den itemları yükle
  useEffect(() => {
    loadItems();
  }, [searchTerm, filterType, filterRarity]);

  const loadItems = async () => {
    try {
      const result = await Database.getItems(searchTerm, filterType === 'all' ? '' : filterType);
      if (result.success) {
        const itemsData = result.data.map(item => ({
          vnum: item.vnum,
          name: item.name,
          type: getItemTypeString(item.type),
          rarity: getItemRarity(item.vnum),
          defaultPrice: item.price,
          level: 1
        }));
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const getItemTypeString = (type) => {
    const types = {
      1: 'weapon',
      2: 'armor', 
      3: 'accessory',
      4: 'consumable',
      5: 'etc'
    };
    return types[type] || 'etc';
  };

  const getItemRarity = (vnum) => {
    // Basit rarity hesaplama - gerçek uygulamada database'den gelecek
    if (vnum >= 50000) return 'legendary';
    if (vnum >= 30000) return 'epic';
    if (vnum >= 20000) return 'rare';
    if (vnum >= 10000) return 'uncommon';
    return 'common';
  };

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