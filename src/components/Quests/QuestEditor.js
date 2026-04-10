import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function QuestEditor({ config }) {
  const { t } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    level_min: 1,
    level_max: 99,
    reward_exp: 0,
    reward_gold: 0,
    reward_item: ''
  });

  const fetchQuests = useCallback(async () => {
    if (!config?.database) return;
    setLoading(true);
    try {
      const result = await ipcRenderer?.invoke('get-quests', config.database);
      if (result?.success) {
        setQuests(result.data || []);
      }
    } catch (err) {
      console.error('Quests fetch error:', err);
    }
    setLoading(false);
  }, [config]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    const filtered = quests.filter(q =>
      q.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.id?.toString().includes(search)
    );
    setFilteredQuests(filtered);
  }, [quests, search]);

  const handleAddQuest = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      level_min: 1,
      level_max: 99,
      reward_exp: 0,
      reward_gold: 0,
      reward_item: ''
    });
    setEditingQuest(null);
    setShowForm(true);
  };

  const handleEditQuest = (quest) => {
    setFormData(quest);
    setEditingQuest(quest.id);
    setShowForm(true);
  };

  const handleSaveQuest = async () => {
    if (!formData.name.trim()) {
      alert('Quest adı gerekli');
      return;
    }

    try {
      const result = await ipcRenderer?.invoke(
        editingQuest ? 'update-quest' : 'create-quest',
        config.database,
        formData
      );

      if (result?.success) {
        fetchQuests();
        setShowForm(false);
      } else {
        alert('Hata: ' + result?.error);
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDeleteQuest = async (questId) => {
    if (!window.confirm("Bu quest'i silmek istediğinizden emin misiniz?")) return;

    try {
      const result = await ipcRenderer?.invoke('delete-quest', config.database, questId);
      if (result?.success) {
        setQuests(quests.filter(q => q.id !== questId));
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Quest Editörü</h1>
          <p className="text-text-muted">Toplam: {quests.length} quest</p>
        </div>
        <button
          onClick={handleAddQuest}
          className="flex items-center space-x-2 bg-cyber-green text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Quest</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Quest adı veya ID ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-green"
        />
      </div>

      {/* Quests List */}
      <div className="grid gap-4">
        {filteredQuests.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-8 text-center text-text-muted">
            Quest bulunamadı
          </div>
        ) : (
          filteredQuests.map(quest => (
            <div key={quest.id} className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-cyber-green/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">{quest.name}</h3>
                  <p className="text-text-muted text-sm mt-1">{quest.description}</p>
                  <div className="flex gap-6 mt-3 text-sm text-text-secondary">
                    <span>📊 Level: {quest.level_min}-{quest.level_max}</span>
                    <span>⭐ Exp: {quest.reward_exp?.toLocaleString('tr-TR')}</span>
                    <span>💰 Gold: {quest.reward_gold?.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditQuest(quest)}
                    className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuest(quest.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
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
                {editingQuest ? 'Quest Düzenle' : 'Yeni Quest'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-dark-hover rounded">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Quest Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  placeholder="Quest adı"
                />
              </div>

              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  placeholder="Quest açıklaması"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Min Level</label>
                  <input
                    type="number"
                    value={formData.level_min}
                    onChange={(e) => setFormData({ ...formData, level_min: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Max Level</label>
                  <input
                    type="number"
                    value={formData.level_max}
                    onChange={(e) => setFormData({ ...formData, level_max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Reward Exp</label>
                  <input
                    type="number"
                    value={formData.reward_exp}
                    onChange={(e) => setFormData({ ...formData, reward_exp: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div>
                  <label className="block text-text-primary text-sm font-medium mb-1">Reward Gold</label>
                  <input
                    type="number"
                    value={formData.reward_gold}
                    onChange={(e) => setFormData({ ...formData, reward_gold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-primary text-sm font-medium mb-1">Reward Item (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.reward_item}
                  onChange={(e) => setFormData({ ...formData, reward_item: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
                  placeholder="Item VNUM"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveQuest}
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

export default QuestEditor;
