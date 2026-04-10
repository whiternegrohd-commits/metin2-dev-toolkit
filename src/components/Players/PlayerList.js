import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Shield, Ban, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function PlayerList({ config }) {
  const { t } = useLanguage();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('level');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchPlayers = useCallback(async () => {
    if (!config?.database) return;
    setLoading(true);
    try {
      const result = await ipcRenderer?.invoke('get-players', config.database);
      if (result?.success) {
        setPlayers(result.data || []);
      }
    } catch (err) {
      console.error('Players fetch error:', err);
    }
    setLoading(false);
  }, [config]);

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, [fetchPlayers]);

  useEffect(() => {
    let filtered = players.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toString().includes(search)
    );

    filtered.sort((a, b) => {
      if (sortBy === 'level') return (b.level || 0) - (a.level || 0);
      if (sortBy === 'exp') return (b.exp || 0) - (a.exp || 0);
      if (sortBy === 'gold') return (b.gold || 0) - (a.gold || 0);
      return 0;
    });

    setFilteredPlayers(filtered);
  }, [players, search, sortBy]);

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Bu oyuncuyu silmek istediğinizden emin misiniz?')) return;
    try {
      const result = await ipcRenderer?.invoke('delete-player', config.database, playerId);
      if (result?.success) {
        setPlayers(players.filter(p => p.id !== playerId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleBanPlayer = async (playerId) => {
    try {
      const result = await ipcRenderer?.invoke('ban-player', config.database, playerId);
      if (result?.success) {
        fetchPlayers();
      }
    } catch (err) {
      console.error('Ban error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Oyuncu Listesi</h1>
        <p className="text-text-muted">Toplam: {players.length} oyuncu</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Oyuncu adı veya ID ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-cyber-green"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-cyber-green"
        >
          <option value="level">Level (Yüksek)</option>
          <option value="exp">Exp (Yüksek)</option>
          <option value="gold">Gold (Yüksek)</option>
        </select>

        <button
          onClick={fetchPlayers}
          disabled={loading}
          className="px-4 py-2 bg-cyber-green text-dark-bg rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Players Table */}
      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-hover border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">Adı</th>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">Level</th>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">Exp</th>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">Gold</th>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">Son Login</th>
                <th className="px-4 py-3 text-left text-text-primary font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">
                    Oyuncu bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => (
                  <tr key={player.id} className="border-b border-dark-border hover:bg-dark-hover transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{player.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{player.level || 0}</td>
                    <td className="px-4 py-3 text-text-secondary">{(player.exp || 0).toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-text-secondary">{(player.gold || 0).toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-3 text-text-muted text-sm">
                      {player.last_login ? new Date(player.last_login).toLocaleDateString('tr-TR') : 'Hiç'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPlayer(player)}
                          className="p-2 hover:bg-dark-border rounded transition-colors"
                          title="Detaylar"
                        >
                          <ChevronDown className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                          onClick={() => handleBanPlayer(player.id)}
                          className="p-2 hover:bg-yellow-500/20 rounded transition-colors"
                          title="Yasakla"
                        >
                          <Ban className="w-4 h-4 text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">{selectedPlayer.name}</h2>
            <div className="space-y-2 text-text-secondary">
              <p><span className="text-text-primary">ID:</span> {selectedPlayer.id}</p>
              <p><span className="text-text-primary">Level:</span> {selectedPlayer.level}</p>
              <p><span className="text-text-primary">Exp:</span> {selectedPlayer.exp?.toLocaleString('tr-TR')}</p>
              <p><span className="text-text-primary">Gold:</span> {selectedPlayer.gold?.toLocaleString('tr-TR')}</p>
              <p><span className="text-text-primary">Sınıf:</span> {selectedPlayer.job || 'Bilinmiyor'}</p>
              <p><span className="text-text-primary">Harita:</span> {selectedPlayer.map_index || 'Bilinmiyor'}</p>
            </div>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="mt-6 w-full px-4 py-2 bg-dark-hover rounded-lg text-text-primary hover:bg-dark-border transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerList;
