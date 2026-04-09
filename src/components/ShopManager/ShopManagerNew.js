import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Package, Database as DatabaseIcon,
  AlertCircle, CheckCircle, Users, RefreshCw, X, Trash2, Eye
} from 'lucide-react';
import NPCPreview from './NPCPreview';
import NPCEditor from './NPCEditor';
import Database from '../../utils/database';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

// ─── Item Listesi (Sağ Panel) ─────────────────────────────────────────────────
function ItemListPanel({ config, tableNames, onDragStart }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async (q = '') => {
    if (!ipcRenderer || !config?.database) return;
    setLoading(true);
    const result = await ipcRenderer.invoke('get-items-from-db', config.database, q, 200);
    if (result.success) setItems(result.data);
    setLoading(false);
  }, [config]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window._itemSearchTimer);
    window._itemSearchTimer = setTimeout(() => loadItems(val), 400);
  };

  return (
    <div className="w-72 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-3">📦 Item Listesi</h3>
      
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          value={search} 
          onChange={e => handleSearch(e.target.value)}
          placeholder="Item ara..."
          className="w-full pl-9 pr-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-sm"
        />
      </div>

      <div className="flex-1 overflow-auto space-y-1.5">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-cyber-green border-t-transparent rounded-full mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-8">Item bulunamadı</p>
        ) : items.map(item => (
          <div
            key={item.vnum}
            draggable
            onDragStart={() => onDragStart(item)}
            className="p-2.5 bg-dark-hover hover:bg-dark-border rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:border-cyber-green/30 transition-all"
          >
            <p className="text-xs font-medium text-text-primary truncate">{item.name}</p>
            <p className="text-xs text-text-muted">#{item.vnum}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-3 text-center">Sürükle → Slot'a bırak</p>
    </div>
  );
}

// ─── Adet Düzenle Modal ────────────────────────────────────────────────────────
function EditCountModal({ item, shopVnum, config, tableNames, onSave, onDelete, onClose }) {
  const [count, setCount] = useState(item.count || 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await ipcRenderer.invoke('update-shop-item', config.database, shopVnum, item.vnum, count, tableNames);
    setSaving(false);
    if (result.success) onSave({ ...item, count });
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu item\'ı kaldırmak istediğinize emin misiniz?')) return;
    const result = await ipcRenderer.invoke('delete-shop-item', config.database, shopVnum, item.vnum, tableNames);
    if (result.success) onDelete(item);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-surface rounded-xl border border-dark-border p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Adet Düzenle</h3>
          <button onClick={onClose} className="p-1 hover:bg-dark-hover rounded">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-dark-hover rounded-lg">
          <p className="text-sm font-medium text-text-primary">{item.name}</p>
          <p className="text-xs text-text-muted">VNum: #{item.vnum}</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-text-muted mb-2">Adet</label>
          <input
            type="number"
            value={count}
            onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
          />
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/30 rounded-lg text-danger text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-sm hover:bg-dark-border transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ana ShopManager ──────────────────────────────────────────────────────────
function ShopManager({ config }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('shops');
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNPCPreview, setShowNPCPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [tableNames, setTableNames] = useState([]);
  const [dbError, setDbError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (config?.database) {
      Database.setConfig(config.database);
      initShops();
    }
  }, [config]);

  const initShops = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const testResult = await Database.testConnection();
      if (!testResult.success) {
        setDbConnected(false);
        setDbError(testResult.error);
        return;
      }
      setDbConnected(true);
      await loadShops();
    } catch (e) {
      setDbConnected(false);
      setDbError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadShops = async () => {
    setLoading(true);
    try {
      if (!ipcRenderer) return;
      const result = await ipcRenderer.invoke('get-shops-auto', config.database);
      if (!result.success) {
        setDbError(result.error);
        return;
      }
      setTableNames(result.tableNames || []);
      const shopsData = result.shops.map(shop => ({
        id: shop.shop_id || shop.npc_vnum,
        name: shop.npc_name || `Shop #${shop.shop_id}`,
        npcVnum: shop.npc_vnum || shop.shop_id,
        npcName: shop.npc_name || `Shop #${shop.shop_id}`,
        itemCount: Number(shop.item_count) || 0,
        items: []
      }));
      setShops(shopsData);
      if (shopsData.length > 0) await selectShop(shopsData[0], result.tableNames);
    } catch (e) {
      setDbError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectShop = async (shop, tNames) => {
    setSelectedShop({ ...shop, items: [] });
    setLoading(true);
    try {
      if (!ipcRenderer) return;
      const usedTables = tNames || tableNames;
      const result = await ipcRenderer.invoke('get-shop-items-auto', config.database, shop.id, usedTables);
      if (result.success) {
        const items = result.data.map((item, idx) => ({
          slot: item.pos ?? idx,
          vnum: item.item_vnum,
          name: item.item_name || `Item #${item.item_vnum}`,
          count: item.count || 1,
          type: item.type,
          subtype: item.subtype
        }));
        setSelectedShop(prev => ({ ...prev, ...shop, items }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-cyber-green/10', 'border-cyber-green');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-cyber-green/10', 'border-cyber-green');
  };

  const handleDrop = async (e, slot) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-cyber-green/10', 'border-cyber-green');
    
    if (!draggedItem || !selectedShop) return;
    
    const newItem = {
      slot,
      vnum: draggedItem.vnum,
      name: draggedItem.name,
      count: 1,
      type: draggedItem.type,
      subtype: draggedItem.subtype
    };

    setSelectedShop(prev => ({
      ...prev,
      items: [...(prev.items || []).filter(i => i.slot !== slot), newItem]
    }));

    if (dbConnected && ipcRenderer) {
      const result = await ipcRenderer.invoke('update-shop-item', config.database, selectedShop.id, draggedItem.vnum, 1, tableNames);
      showStatus(result.success, result.success ? '✓ Item eklendi' : '✗ Hata');
    }
    setDraggedItem(null);
  };

  const handleRemoveItem = async (item) => {
    if (!selectedShop) return;
    setSelectedShop(prev => ({ ...prev, items: prev.items.filter(i => i.vnum !== item.vnum) }));
    if (dbConnected && ipcRenderer) {
      await ipcRenderer.invoke('delete-shop-item', config.database, selectedShop.id, item.vnum, tableNames);
    }
    setEditingItem(null);
    showStatus(true, '✓ Item kaldırıldı');
  };

  const handleEditSave = (updatedItem) => {
    setSelectedShop(prev => ({
      ...prev,
      items: prev.items.map(i => i.vnum === updatedItem.vnum ? { ...i, ...updatedItem } : i)
    }));
    setEditingItem(null);
    showStatus(true, '✓ Kaydedildi');
  };

  const showStatus = (ok, msg) => {
    setSaveStatus({ type: ok ? 'success' : 'error', message: msg });
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const tabs = [
    { id: 'shops', label: 'Dükkanlar', icon: Package },
    { id: 'npc-editor', label: 'NPC Editörü', icon: Users }
  ];

  const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
                : 'bg-dark-surface border border-dark-border text-text-muted hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'npc-editor' ? (
        <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-5">
          <NPCEditor config={config} />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sol Panel - Dükkan Listesi */}
          <div className="w-64 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary">🏪 Dükkanlar</h2>
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 text-xs ${dbConnected ? 'text-success' : 'text-danger'}`}>
                  <DatabaseIcon className="w-3 h-3" />
                  <span>{dbConnected ? 'Bağlı' : 'Bağlantısız'}</span>
                </div>
                <button
                  onClick={loadShops}
                  title="Yenile"
                  className="p-1.5 bg-dark-hover hover:bg-dark-border rounded-lg border border-dark-border transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-text-muted ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {dbError && (
              <div className="mb-2 p-2 bg-danger/10 border border-danger/30 rounded-lg">
                <p className="text-xs text-danger">{dbError}</p>
              </div>
            )}

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Dükkan ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-xs"
              />
            </div>

            <div className="flex-1 overflow-auto space-y-1">
              {loading && shops.length === 0 ? (
                <div className="text-center py-6">
                  <div className="animate-spin w-5 h-5 border-2 border-cyber-green border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Yükleniyor...</p>
                </div>
              ) : filteredShops.map(shop => (
                <div
                  key={shop.id}
                  onClick={() => selectShop(shop)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedShop?.id === shop.id
                      ? 'bg-cyber-green/10 border border-cyber-green/30'
                      : 'bg-dark-hover hover:bg-dark-border border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-vivid-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-vivid-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{shop.name}</p>
                      <p className="text-xs text-text-muted">#{shop.id}</p>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">{shop.itemCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orta Panel - Shop Grid */}
          <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-4 flex flex-col min-w-0">
            {selectedShop ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{selectedShop.name}</h2>
                    <p className="text-xs text-text-muted">ID #{selectedShop.id} · {selectedShop.items?.length || 0} item</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saveStatus && (
                      <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                        saveStatus.type === 'success'
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-danger/10 border-danger/30 text-danger'
                      }`}>
                        {saveStatus.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{saveStatus.message}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setShowNPCPreview(!showNPCPreview)}
                      className="px-3 py-1.5 bg-vivid-blue/10 hover:bg-vivid-blue/20 rounded-lg border border-vivid-blue/30 text-vivid-blue text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      {showNPCPreview ? 'Gizle' : 'NPC'}
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-6 gap-2 p-3 rounded-lg border-2 border-dashed border-dark-border overflow-auto">
                  {Array.from({ length: 48 }, (_, i) => {
                    const item = selectedShop.items?.find(it => it.slot === i);
                    return (
                      <div
                        key={i}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, i)}
                        onClick={() => item && setEditingItem(item)}
                        className={`relative aspect-square rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 ${
                          item
                            ? 'bg-dark-hover border-vivid-blue/50 hover:border-cyber-green'
                            : 'bg-dark-bg border-dark-border hover:border-cyber-green/30'
                        }`}
                      >
                        {item ? (
                          <>
                            <Package className="w-5 h-5 text-vivid-blue mb-0.5" />
                            <p className="text-xs text-text-primary text-center leading-tight truncate w-full px-0.5 font-medium">
                              {item.name}
                            </p>
                            <p className="text-xs text-cyber-green font-semibold">
                              {item.count} adet
                            </p>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveItem(item);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-danger rounded-full opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted opacity-20">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Package className="w-16 h-16 text-text-muted mx-auto mb-3 opacity-30" />
                  <h3 className="text-base font-medium text-text-primary mb-1">Dükkan Seçin</h3>
                  <p className="text-sm text-text-muted">Sol panelden bir dükkan seçin</p>
                </div>
              </div>
            )}
          </div>

          {/* Sağ Panel - Item Listesi + NPC Preview */}
          <div className="flex flex-col gap-3">
            {showNPCPreview && selectedShop && (
              <NPCPreview npcVnum={selectedShop.npcVnum} npcName={selectedShop.npcName} />
            )}
            <ItemListPanel
              config={config}
              tableNames={tableNames}
              onDragStart={setDraggedItem}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {editingItem && selectedShop && (
        <EditCountModal
          item={editingItem}
          shopVnum={selectedShop.id}
          config={config}
          tableNames={tableNames}
          onSave={handleEditSave}
          onDelete={handleRemoveItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

export default ShopManager;
