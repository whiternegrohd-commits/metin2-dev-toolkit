import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search, Map } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function MapEditor({ config }) {
  const { t } = useLanguage();
  const [maps, setMaps] = useState([]);
  const [filteredMaps, setFilteredMaps] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMap, setEditingMap] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    x: 0,
    y: 0,
    width: 256,
    height: 256,
    type: 'normal',
    description: ''
  });

  const fetchMaps = useCallback(async () => {
    if (!config?.database) return;
    setLoading(true);
    try {
      const result = await ipcRenderer?.invoke('get-maps', config.database);
      if (result?.success) {
        setMaps(result.data || []);
      }
    } catch (err) {
      console.error('Maps fetch error:', err);
    }
    setLoading(false);
  }, [config]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  useEffect(() => {
    const filtered = maps.filter(m =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.id?.toString().includes(search)
    );
    setFilteredMaps(filtered);
  }, [maps, search]);

  const handleAddMap = () => {
    setFormData({
      id: '',
      name: '',
      x: 0,
      y: 0,
      width: 256,
      height: 256,
      type: 'normal',
      description: ''
    });
    setEditingMap(null);
    setShowForm(true);
  };

  const handleEditMap = (map) => {
    setFormData(map);
    setEditingMap(map.id);
    setShowForm(true);
  };

  const handleSaveMap = async () => {
    if (!formData.name.trim()) {
      alert('Harita adı gerekli');
      return;
    }

    try {
      const result = await ipcRenderer?.invoke(
        editingMap ? 'update-map' : 'create-map',
        config.database,
        formData
      );

      if (result?.success) {
        fetchMaps();
        setShowForm(false);
      } else {
        alert('Hata: ' + result?.error);
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDeleteMap = async (mapId) => {
    if (!window.confirm('Bu haritayı silmek istediğinizden emin misiniz?')) return;

    try {
      const result = await ipcRenderer?.invoke('delete-map', config.database, mapId);
      if (result?.success) {
        setMaps(maps.filter(m => m.id !== mapId));
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const mapTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'dungeon', label: 'Dungeon' },
    { value: 'boss', label: 'Boss' },
    { value: 'pvp', label: 'PvP' },
    { value: 'safe', label: 'Güvenli Bölge' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Harita Editörü</h1>
          <p className="text-text-muted">Toplam: {maps.length} harita</p>
        </div>
        <button
          onClick={handleAddMap}
          className="flex items-center space-x-2 bg-cyber-green text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Harita</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Harita adı veya ID ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-green"
        />
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaps.length === 0 ? (
          <div className="col-span-full bg-dark-surface border border-dark-border rounded-lg p-8 text-center text-text-muted">
            Harita bulunamadı
          </div>
        ) : (
          filteredMaps.map(map => (
            <div key={map.id} className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-cyber-green/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">{map.name}</h3>
                  <p className="text-text-muted text-sm">ID: {map.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMap(map)}
                    className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteMap(map.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Tür:</span>
                  <span className="text-cyber-green">{mapTypes.find(t => t.value === map.type)?.label || map.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Konum:</span>
                  <span>({map.x}, {map.y})</span>
                </div>
                <div className="flex justify-between">
                  <span>Boyut:</span>
                  <span>{map.width}x{map.height}</span>
                </div>
              </div>

              {map.description && (
                <p className="text-text-muted text-xs mt-3 p-2 bg-dark-hover rounded">
                  {map.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                {editingMap ? 'Harita Düzenle' : 'Yeni Harita'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-dark-hover rounded">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Harita Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  placeholder="Harita adı"
                />
              </div>

              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Tür</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                >
                  {mapTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">X Koordinatı</label>
                  <input
                    type="number"
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Y Koordinatı</label>
                  <input
                    type="number"
                    value={formData.y}
                    onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Genişlik</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Yükseklik</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  placeholder="Harita açıklaması"
                  rows="2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveMap}
                className="flex-1 flex items-center justify-center space-x-2 bg-cyber-green text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                <Save className="w-5 h-5" />
                <span>Kaydet</span>
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-dark-hover rounded-lg text-text-primary hover:bg-dark-border transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapEditor;
