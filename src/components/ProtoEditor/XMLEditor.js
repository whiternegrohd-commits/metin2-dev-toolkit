import React, { useState } from 'react';
import { Upload, Search, Save, X, Edit2, Plus, Trash2 } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function XMLEditor() {
  const [xmlData, setXmlData] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async () => {
    if (!ipcRenderer) return;
    const result = await ipcRenderer.invoke('select-file', [{ name: 'XML Files', extensions: ['xml'] }]);
    if (result) {
      setFilePath(result);
      loadXML(result);
    }
  };

  const loadXML = async (path) => {
    setLoading(true);
    try {
      if (!ipcRenderer) return;
      const result = await ipcRenderer.invoke('read-file', path);
      if (result.success) {
        // Büyük dosyalar için streaming parse
        const xmlStr = result.data;
        
        // Item tag'lerini regex ile çıkar
        const itemRegex = /<Item\s+([^>]+)\/?>/g;
        const items = [];
        let match;

        while ((match = itemRegex.exec(xmlStr)) !== null) {
          const attrs = {};
          const attrStr = match[1];
          const attrRegex = /(\w+)="([^"]*)"/g;
          let attrMatch;

          while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
            attrs[attrMatch[1]] = attrMatch[2];
          }

          items.push({
            index: items.length,
            vnum: attrs.VNUM || '',
            name: attrs.Name || '',
            type: attrs.Type || '',
            subtype: attrs.Subtype || '',
            price: attrs.Price || '',
            allAttrs: attrs
          });
        }

        setXmlData(xmlStr);
        setItems(items);
        
        if (items.length === 0) {
          alert('Hiç item bulunamadı!');
        }
      }
    } catch (e) {
      alert('Dosya yüklenemedi: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.vnum?.toLowerCase().includes(search) ||
      item.name?.toLowerCase().includes(search)
    );
  });

  const handleEditStart = (item) => {
    setEditingItem(item);
    setEditValues({
      vnum: item.vnum || '',
      name: item.name || '',
      type: item.type || '',
      subtype: item.subtype || '',
      price: item.price || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !xmlData) return;

    let newXML = xmlData;
    const itemRegex = new RegExp(`<Item\\s+([^>]*VNUM="${editingItem.vnum}"[^>]*)\\s*/?>`);
    
    const newAttrs = Object.entries(editValues)
      .map(([k, v]) => `${k}="${v.replace(/"/g, '&quot;')}"`)
      .join(' ');

    newXML = newXML.replace(itemRegex, `<Item ${newAttrs}/>`);
    setXmlData(newXML);

    const updatedItems = items.map((item, idx) => 
      idx === editingItem.index 
        ? { ...item, ...editValues }
        : item
    );
    setItems(updatedItems);
    setEditingItem(null);
  };

  const handleSaveFile = async () => {
    if (!xmlData || !filePath) return;
    setLoading(true);
    try {
      if (!ipcRenderer) return;
      const result = await ipcRenderer.invoke('write-file', filePath, xmlData);
      if (result.success) {
        alert('✓ Dosya kaydedildi!');
      } else {
        alert('✗ Hata: ' + result.error);
      }
    } catch (e) {
      alert('Kaydetme hatası: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-bg p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">📄 XML Editor</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFileSelect}
            className="flex items-center gap-2 px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            XML Yükle
          </button>
          {filePath && (
            <button
              onClick={handleSaveFile}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-vivid-blue hover:bg-vivid-blue/80 rounded-lg text-dark-bg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          )}
        </div>
      </div>

      {filePath && (
        <div className="text-xs text-text-muted bg-dark-surface rounded-lg p-2 border border-dark-border">
          📁 {filePath}
        </div>
      )}

      {items.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="VNum veya Name ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none"
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-auto space-y-2">
            {filteredItems.map(item => (
              <div
                key={item.index}
                className="p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-cyber-green/30 transition-all flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">VNum: {item.vnum} | Type: {item.type} | Price: {item.price}</p>
                </div>
                <button
                  onClick={() => handleEditStart(item)}
                  className="p-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 rounded-lg text-vivid-blue transition-colors flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>XML dosyası yükle</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface rounded-xl border border-dark-border p-6 w-96 max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Item Düzenle</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-dark-hover rounded"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">VNum</label>
                <input
                  type="text"
                  value={editValues.vnum}
                  onChange={e => setEditValues({ ...editValues, vnum: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
                  <input
                    type="text"
                    value={editValues.type}
                    onChange={e => setEditValues({ ...editValues, type: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Subtype</label>
                  <input
                    type="text"
                    value={editValues.subtype}
                    onChange={e => setEditValues({ ...editValues, subtype: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Price</label>
                <input
                  type="text"
                  value={editValues.price}
                  onChange={e => setEditValues({ ...editValues, price: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary hover:bg-dark-border transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
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

export default XMLEditor;
