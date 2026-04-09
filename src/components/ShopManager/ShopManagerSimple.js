import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, RefreshCw, Database as DatabaseIcon } from 'lucide-react';
import Database from '../../utils/database';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function ShopManagerSimple({ config }) {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchShop, setSearchShop] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [tableNames, setTableNames] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editCount, setEditCount] = useState(1);
  const [draggedItem, setDraggedItem] = useState(null);

  // 🔥 HOT RELOAD TEST - Bu mesaj değiştirildi! (v2)
  console.log('🚀 ShopManager yüklendi - Hot reload çalışıyor! ✅');

  useEffect(() => {
    if (config?.database) {
      Database.setConfig(config.database);
      initShops();
    }
  }, [config]);

  const initShops = async () => {
    setLoading(true);
    try {
      const testResult = await Database.testConnection();
      setDbConnected(testResult.success);
      if (testResult.success) await loadShops();
    } catch (e) {
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadShops = async () => {
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('get-shops-auto', config.database);
    if (result.success) {
      setTableNames(result.tableNames || []);
      const shopsData = result.shops.map(shop => ({
        id: shop.shop_id || shop.npc_vnum,
        name: shop.npc_name || `Shop #${shop.shop_id}`,
        npcVnum: shop.npc_vnum || shop.shop_id,
        itemCount: Number(shop.item_count) || 0
      }));
      setShops(shopsData);
      if (shopsData.length > 0) selectShop(shopsData[0]);
    }
  };

  const selectShop = async (shop) => {
    setSelectedShop(shop);
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('get-shop-items-auto', config.database, shop.id, tableNames);
    if (result.success) {
      const itemsData = result.data.map(item => ({
        vnum: item.item_vnum,
        name: item.item_name || `Item #${item.item_vnum}`,
        count: item.count || 1
      }));
      setItems(itemsData);
    }
  };

  const loadAllItems = async (q = '') => {
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('get-items-from-db', config.database, q, 300);
    if (result.success) {
      setAllItems(result.data.map(item => ({
        vnum: item.vnum,
        name: item.name
      })));
    }
  };

  useEffect(() => {
    loadAllItems();
  }, []);

  const handleAddItem = async (item) => {
    if (!selectedShop) return;
    const result = await ipcRenderer.invoke('update-shop-item', config.database, selectedShop.id, item.vnum, 1, tableNames);
    if (result.success) {
      const newItem = { vnum: item.vnum, name: item.name, count: 1 };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = async (item) => {
    if (!selectedShop) return;
    const result = await ipcRenderer.invoke('delete-shop-item', config.database, selectedShop.id, item.vnum, tableNames);
    if (result.success) {
      setItems(items.filter(i => i.vnum !== item.vnum));
    }
  };

  const handleUpdateCount = async (item, newCount) => {
    if (!selectedShop) return;
    const result = await ipcRenderer.invoke('update-shop-item', config.database, selectedShop.id, item.vnum, newCount, tableNames);
    if (result.success) {
      setItems(items.map(i => i.vnum === item.vnum ? { ...i, count: newCount } : i));
      setEditingItem(null);
    }
  };

  const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchShop.toLowerCase()));
  const filteredItems = allItems.filter(i => {
    const searchLower = searchItem.toLowerCase();
    const matchesName = i.name.toLowerCase().includes(searchLower);
    const matchesVnum = i.vnum.toString().includes(searchLower);
    const notAdded = !items.find(si => si.vnum === i.vnum);
    return (matchesName || matchesVnum) && notAdded;
  });

  return (
    <div className="h-full flex flex-col bg-dark-bg p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">🏪 Shop Manager</h1>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg ${dbConnected ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            <DatabaseIcon className="w-4 h-4" />
            {dbConnected ? 'Bağlı' : 'Bağlantısız'}
          </div>
          <button onClick={loadShops} className="p-2 bg-dark-surface hover:bg-dark-hover rounded-lg border border-dark-border">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sol: Dükkan Listesi */}
        <div className="w-80 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Dükkanlar</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Dükkan ara..."
              value={searchShop}
              onChange={e => setSearchShop(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-auto space-y-2">
            {filteredShops.map(shop => (
              <div
                key={shop.id}
                onClick={() => selectShop(shop)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedShop?.id === shop.id
                    ? 'bg-cyber-green/20 border border-cyber-green/50'
                    : 'bg-dark-hover hover:bg-dark-border border border-dark-border'
                }`}
              >
                <p className="font-medium text-text-primary">{shop.name}</p>
                <p className="text-xs text-text-muted">#{shop.id} · {shop.itemCount} item</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orta: Shop Items */}
        <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col">
          {selectedShop ? (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-3">{selectedShop.name}</h2>
              <div className="flex-1 overflow-auto">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-text-muted">
                    <p>Henüz item yok. Sağdan item ekle.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.vnum} className="flex items-center gap-3 p-3 bg-dark-hover rounded-lg border border-dark-border hover:border-cyber-green/30 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{item.name}</p>
                          <p className="text-xs text-text-muted">#{item.vnum}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-cyber-green">{item.count} adet</span>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditCount(item.count);
                            }}
                            className="p-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 rounded-lg text-vivid-blue transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="p-2 bg-danger/10 hover:bg-danger/20 rounded-lg text-danger transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <p>Dükkan seçin</p>
            </div>
          )}
        </div>

        {/* Sağ: Item Listesi */}
        <div className="w-80 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Eklenecek Items</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Item ara..."
              value={searchItem}
              onChange={e => {
                setSearchItem(e.target.value);
                clearTimeout(window._itemSearchTimer);
                window._itemSearchTimer = setTimeout(() => loadAllItems(e.target.value), 300);
              }}
              className="w-full pl-10 pr-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-auto space-y-2">
            {filteredItems.map(item => (
              <div
                key={item.vnum}
                draggable
                onDragStart={() => setDraggedItem(item)}
                className="p-3 bg-dark-hover hover:bg-dark-border rounded-lg cursor-grab active:cursor-grabbing border border-dark-border hover:border-cyber-green/30 transition-all flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate text-sm">{item.name}</p>
                  <p className="text-xs text-text-muted">#{item.vnum}</p>
                </div>
                <button
                  onClick={() => handleAddItem(item)}
                  className="p-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 rounded-lg text-cyber-green transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface rounded-xl border border-dark-border p-6 w-96">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{editingItem.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-muted mb-2">Adet</label>
              <input
                type="number"
                value={editCount}
                onChange={e => setEditCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary hover:bg-dark-border transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleUpdateCount(editingItem, editCount)}
                className="flex-1 px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg font-medium transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopManagerSimple;
