import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { 
  Plus, 
  Search, 
  Filter, 
  Save, 
  Upload, 
  Download,
  Eye,
  Edit3,
  Trash2,
  Package
} from 'lucide-react';

import NPCPreview from './NPCPreview';
import ItemSlot from './ItemSlot';
import ShopItemList from './ShopItemList';

function ShopManager() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNPCPreview, setShowNPCPreview] = useState(true);

  // Mock data - gerçek uygulamada database'den gelecek
  useEffect(() => {
    const mockShops = [
      {
        id: 1,
        name: 'Silah Dükkanı',
        npcVnum: 9001,
        npcName: 'Silahçı Wang',
        items: [
          { slot: 0, vnum: 10, count: 1, price: 1000 },
          { slot: 1, vnum: 20, count: 1, price: 2000 },
          { slot: 2, vnum: 30, count: 1, price: 3000 }
        ]
      },
      {
        id: 2,
        name: 'Zırh Dükkanı',
        npcVnum: 9002,
        npcName: 'Zırhçı Lee',
        items: [
          { slot: 0, vnum: 11001, count: 1, price: 5000 },
          { slot: 1, vnum: 11002, count: 1, price: 7500 }
        ]
      }
    ];
    setShops(mockShops);
    setSelectedShop(mockShops[0]);
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: 'item',
    drop: (item, monitor) => {
      const targetSlot = monitor.getDropResult();
      if (targetSlot) {
        handleItemDrop(item, targetSlot.slot);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleItemDrop = (item, slot) => {
    if (!selectedShop) return;

    const updatedShop = {
      ...selectedShop,
      items: [
        ...selectedShop.items.filter(shopItem => shopItem.slot !== slot),
        { slot, vnum: item.vnum, count: 1, price: item.defaultPrice || 1000 }
      ]
    };

    setSelectedShop(updatedShop);
    setShops(shops.map(shop => shop.id === selectedShop.id ? updatedShop : shop));
  };

  const handleRemoveItem = (slot) => {
    if (!selectedShop) return;

    const updatedShop = {
      ...selectedShop,
      items: selectedShop.items.filter(item => item.slot !== slot)
    };

    setSelectedShop(updatedShop);
    setShops(shops.map(shop => shop.id === selectedShop.id ? updatedShop : shop));
  };

  const handleSaveShop = async () => {
    // Burada SQL'e kaydetme işlemi yapılacak
    console.log('Saving shop:', selectedShop);
    // Mock save operation
    alert('Dükkan başarıyla kaydedildi!');
  };

  return (
    <div className="h-full flex space-x-6">
      {/* Sol Panel - Dükkan Listesi */}
      <div className="w-80 bg-dark-surface rounded-xl border border-dark-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Dükkanlar</h2>
          <button className="p-2 bg-cyber-green/10 hover:bg-cyber-green/20 rounded-lg border border-cyber-green/30 transition-colors">
            <Plus className="w-4 h-4 text-cyber-green" />
          </button>
        </div>

        {/* Arama */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Dükkan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none"
          />
        </div>

        {/* Dükkan Listesi */}
        <div className="space-y-2">
          {shops
            .filter(shop => shop.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(shop => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedShop?.id === shop.id
                    ? 'bg-cyber-green/10 border border-cyber-green/30'
                    : 'bg-dark-hover hover:bg-dark-border border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-vivid-blue/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-vivid-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-text-primary">{shop.name}</h3>
                    <p className="text-xs text-text-muted">{shop.npcName}</p>
                  </div>
                  <div className="text-xs text-text-muted">
                    {shop.items.length} item
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Orta Panel - Dükkan Editörü */}
      <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-6">
        {selectedShop ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{selectedShop.name}</h2>
                <p className="text-text-muted">NPC: {selectedShop.npcName} (#{selectedShop.npcVnum})</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNPCPreview(!showNPCPreview)}
                  className="px-3 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 rounded-lg border border-vivid-blue/30 text-vivid-blue text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  {showNPCPreview ? 'Önizlemeyi Gizle' : 'Önizlemeyi Göster'}
                </button>
                <button
                  onClick={handleSaveShop}
                  className="px-4 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 rounded-lg border border-cyber-green/30 text-cyber-green text-sm transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Kaydet
                </button>
              </div>
            </div>

            {/* Shop Grid */}
            <div 
              ref={drop}
              className={`flex-1 grid grid-cols-5 gap-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                isOver ? 'border-cyber-green bg-cyber-green/5' : 'border-dark-border'
              }`}
            >
              {Array.from({ length: 40 }, (_, index) => {
                const item = selectedShop.items.find(item => item.slot === index);
                return (
                  <ItemSlot
                    key={index}
                    slot={index}
                    item={item}
                    onRemove={() => handleRemoveItem(index)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Dükkan Seçin</h3>
              <p className="text-text-muted">Düzenlemek için sol panelden bir dükkan seçin</p>
            </div>
          </div>
        )}
      </div>

      {/* Sağ Panel - NPC Önizleme ve Item Listesi */}
      <div className="w-80 space-y-4">
        {/* NPC Önizleme */}
        {showNPCPreview && selectedShop && (
          <NPCPreview npcVnum={selectedShop.npcVnum} npcName={selectedShop.npcName} />
        )}

        {/* Item Listesi */}
        <ShopItemList onItemDrag={(item) => console.log('Dragging item:', item)} />
      </div>
    </div>
  );
}

export default ShopManager;