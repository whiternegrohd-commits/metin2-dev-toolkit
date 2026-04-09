import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function NPCEditor({ config }) {
  const { t } = useLanguage();
  const [npcs, setNpcs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [filePath, setFilePath] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', model: '' });

  // Context menu
  const [ctxMenu, setCtxMenu] = useState(null);
  const ctxRef = useRef(null);

  const serverPath = config?.paths?.server;

  useEffect(() => {
    if (serverPath) loadNPCs();
  }, [serverPath]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(npcs.filter(n => n.code.toLowerCase().includes(q) || n.model.toLowerCase().includes(q)));
  }, [search, npcs]);

  // Context menu dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNPCs = async () => {
    if (!serverPath) return;
    setLoading(true);
    try {
      if (!ipcRenderer) {
        // Mock data
        setNpcs([
          { id: 0, code: '20000', model: 'npc_warrior' },
          { id: 1, code: '20001', model: 'npc_mage' },
          { id: 2, code: '20002', model: 'mount_horse' },
        ]);
        setFilePath(serverPath + '/root/npclist.txt');
        return;
      }
      const result = await ipcRenderer.invoke('read-npclist', serverPath);
      if (result.success) {
        setNpcs(result.npcs);
        setFilePath(result.filePath);
      } else {
        showStatus(false, result.error);
      }
    } catch (e) {
      showStatus(false, e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNPCs = async (updatedNpcs) => {
    if (!serverPath) return false;
    try {
      if (!ipcRenderer) { setNpcs(updatedNpcs); return true; }
      const result = await ipcRenderer.invoke('write-npclist', serverPath, updatedNpcs);
      if (result.success) { setNpcs(updatedNpcs); return true; }
      showStatus(false, result.error);
      return false;
    } catch (e) {
      showStatus(false, e.message);
      return false;
    }
  };

  const showStatus = (ok, msg) => {
    setStatus({ ok, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ code: '', model: '' });
    setShowForm(true);
  };

  const openEdit = (npc) => {
    setEditingId(npc.id);
    setForm({ code: npc.code, model: npc.model });
    setShowForm(true);
    setCtxMenu(null);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.model.trim()) return;
    let updated;
    if (editingId !== null) {
      updated = npcs.map(n => n.id === editingId ? { ...n, code: form.code.trim(), model: form.model.trim() } : n);
    } else {
      const newId = npcs.length > 0 ? Math.max(...npcs.map(n => n.id)) + 1 : 0;
      updated = [...npcs, { id: newId, code: form.code.trim(), model: form.model.trim() }];
    }
    const ok = await saveNPCs(updated);
    if (ok) {
      showStatus(true, t('npc_saved'));
      setShowForm(false);
    }
  };

  const handleDelete = async (npc) => {
    setCtxMenu(null);
    if (!window.confirm(t('confirm_delete'))) return;
    const updated = npcs.filter(n => n.id !== npc.id).map((n, i) => ({ ...n, id: i }));
    const ok = await saveNPCs(updated);
    if (ok) showStatus(true, t('npc_deleted'));
  };

  const handleRightClick = (e, npc) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, npc });
  };

  if (!serverPath) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="w-10 h-10 text-warning mx-auto mb-3" />
          <p className="text-text-muted text-sm">{t('npc_file_not_set')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{t('npc_editor')}</h2>
          {filePath && <p className="text-xs text-text-muted font-mono mt-0.5">{filePath}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={loadNPCs} disabled={loading}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors" title="Yenile">
            <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openAdd}
            className="flex items-center space-x-2 px-3 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>{t('add_npc')}</span>
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center space-x-2 p-2.5 rounded-lg border mb-3 text-sm ${
          status.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
        }`}>
          {status.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{status.msg}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search_npc')}
          className="w-full pl-9 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-sm" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-dark-border">
        <table className="w-full text-sm">
          <thead className="bg-dark-hover sticky top-0">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">{t('npc_code')}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">{t('npc_model')}</th>
              <th className="px-4 py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-text-muted">{t('loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-text-muted">{t('no_npc_found')}</td></tr>
            ) : filtered.map((npc, i) => (
              <tr key={npc.id} onContextMenu={e => handleRightClick(e, npc)}
                className="border-t border-dark-border hover:bg-dark-hover transition-colors cursor-context-menu">
                <td className="px-4 py-2.5 text-text-muted font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-2.5 text-cyber-green font-mono">{npc.code}</td>
                <td className="px-4 py-2.5 text-text-primary">{npc.model}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center space-x-1 justify-end">
                    <button onClick={() => openEdit(npc)}
                      className="p-1.5 hover:bg-vivid-blue/20 rounded text-text-muted hover:text-vivid-blue transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(npc)}
                      className="p-1.5 hover:bg-danger/20 rounded text-text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted mt-2">{filtered.length} / {npcs.length} NPC — {t('right_click_hint') || 'Sağ tık: Düzenle / Sil'}</p>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface rounded-xl border border-dark-border p-5 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">{editingId !== null ? t('edit_npc') : t('add_npc')}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-dark-hover rounded">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">{t('npc_code')}</label>
                <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm font-mono"
                  placeholder="20000" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">{t('npc_model')}</label>
                <input type="text" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm"
                  placeholder="npc_warrior"
                  onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowForm(false)}
                className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-sm transition-colors hover:bg-dark-border">
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={!form.code.trim() || !form.model.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg text-sm font-medium transition-colors disabled:opacity-40">
                <Save className="w-3.5 h-3.5" />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {ctxMenu && (
        <div ref={ctxRef}
          className="fixed bg-dark-surface border border-dark-border rounded-lg shadow-xl z-50 py-1 min-w-32"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}>
          <button onClick={() => openEdit(ctxMenu.npc)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-dark-hover transition-colors">
            <Edit3 className="w-3.5 h-3.5 text-vivid-blue" />
            <span>{t('edit')}</span>
          </button>
          <button onClick={() => handleDelete(ctxMenu.npc)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('delete_npc')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default NPCEditor;
