import React, { useState } from 'react';
import { Map, Plus, Save, Upload, Trash2, Copy, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function MapTool() {
  const { t } = useLanguage();
  const [maps, setMaps] = useState([]);
  const [search, setSearch] = useState('');
  const [filePath, setFilePath] = useState('');
  const [status, setStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState({ name: '', x: '', y: '', width: '', height: '' });
  const [teleportInput, setTeleportInput] = useState({ x: '', y: '', mapName: '' });
  const [teleportCode, setTeleportCode] = useState('');
  const [copied, setCopied] = useState(false);

  const showStatus = (ok, msg) => {
    setStatus({ ok, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const loadFile = async () => {
    if (!ipcRenderer) {
      setMaps([
        { name: 'metin2_map_a1', x: '0', y: '0', width: '1024', height: '1024' },
        { name: 'metin2_map_b1', x: '1024', y: '0', width: '1024', height: '1024' },
      ]);
      setFilePath('mock/atlasinfo.txt');
      return;
    }
    const path = await ipcRenderer.invoke('select-file', [{ name: 'AtlasInfo', extensions: ['txt'] }]);
    if (!path) return;
    const result = await ipcRenderer.invoke('read-file', path);
    if (!result.success) { showStatus(false, result.error); return; }
    const parsed = result.data.split('\n')
      .filter(l => l.trim() && !l.startsWith('//'))
      .map(l => {
        const parts = l.trim().split(/\s+/);
        return { name: parts[0] || '', x: parts[1] || '0', y: parts[2] || '0', width: parts[3] || '0', height: parts[4] || '0' };
      });
    setMaps(parsed);
    setFilePath(path);
    showStatus(true, `${parsed.length} harita yüklendi`);
  };

  const saveFile = async () => {
    if (!filePath || maps.length === 0) return;
    const content = maps.map(m => `${m.name}\t${m.x}\t${m.y}\t${m.width}\t${m.height}`).join('\n') + '\n';
    if (!ipcRenderer) { showStatus(true, 'Kaydedildi (mock)'); return; }
    const result = await ipcRenderer.invoke('write-file', filePath, content);
    showStatus(result.success, result.success ? 'Kaydedildi ✓' : result.error);
  };

  const openAdd = () => {
    setEditingIdx(null);
    setForm({ name: '', x: '0', y: '0', width: '1024', height: '1024' });
    setShowForm(true);
  };

  const openEdit = (idx) => {
    setEditingIdx(idx);
    setForm({ ...maps[idx] });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingIdx !== null) {
      setMaps(p => p.map((m, i) => i === editingIdx ? { ...form } : m));
    } else {
      setMaps(p => [...p, { ...form }]);
    }
    setShowForm(false);
  };

  const handleDelete = (idx) => {
    if (!window.confirm('Bu haritayı silmek istediğinize emin misiniz?')) return;
    setMaps(p => p.filter((_, i) => i !== idx));
  };

  const generateTeleport = () => {
    if (!teleportInput.x || !teleportInput.y) return;
    const code = `/warp ${teleportInput.x} ${teleportInput.y}`;
    setTeleportCode(code);
  };

  const copyTeleport = () => {
    navigator.clipboard.writeText(teleportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = maps.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const inputClass = "w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-text-muted mb-1";

  return (
    <div className="h-full flex space-x-4">
      {/* Sol: Atlas listesi */}
      <div className="flex-1 bg-dark-surface rounded-xl border border-dark-border p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-vivid-blue/10 rounded-lg border border-vivid-blue/20">
              <Map className="w-5 h-5 text-vivid-blue" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary">{t('map_tool_title')}</h1>
              {filePath && <p className="text-xs text-text-muted font-mono">{filePath}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={loadFile}
              className="flex items-center space-x-1.5 px-3 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue text-sm transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{t('load_file')}</span>
            </button>
            {maps.length > 0 && (
              <>
                <button onClick={saveFile}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-sm transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save_file')}</span>
                </button>
                <button onClick={openAdd}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-sm transition-colors hover:bg-dark-border">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_map')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {status && (
          <div className={`flex items-center space-x-2 p-2.5 rounded-lg border mb-3 text-sm ${
            status.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
          }`}>
            {status.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{status.msg}</span>
          </div>
        )}

        {maps.length > 0 ? (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('search_map')}
                className="w-full pl-9 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-sm" />
            </div>
            <div className="flex-1 overflow-auto rounded-lg border border-dark-border">
              <table className="w-full text-sm">
                <thead className="bg-dark-hover sticky top-0">
                  <tr>
                    {[t('map_name'), 'X', 'Y', t('width'), t('height'), ''].map((h, i) => (
                      <th key={i} className="text-left px-3 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={i} className="border-t border-dark-border hover:bg-dark-hover transition-colors">
                      <td className="px-3 py-2.5 text-cyber-green font-mono text-xs">{m.name}</td>
                      <td className="px-3 py-2.5 text-text-primary font-mono text-xs">{m.x}</td>
                      <td className="px-3 py-2.5 text-text-primary font-mono text-xs">{m.y}</td>
                      <td className="px-3 py-2.5 text-text-muted font-mono text-xs">{m.width}</td>
                      <td className="px-3 py-2.5 text-text-muted font-mono text-xs">{m.height}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center space-x-1">
                          <button onClick={() => openEdit(maps.indexOf(m))}
                            className="px-2 py-1 text-xs bg-vivid-blue/10 hover:bg-vivid-blue/20 rounded text-vivid-blue transition-colors">{t('edit')}</button>
                          <button onClick={() => handleDelete(maps.indexOf(m))}
                            className="p-1 hover:bg-danger/20 rounded text-text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-2">{filtered.length} / {maps.length} harita</p>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted text-sm">{t('no_file_loaded')}</p>
              <p className="text-text-muted text-xs mt-1">atlasinfo.txt dosyasını yükle</p>
            </div>
          </div>
        )}
      </div>

      {/* Sağ: Teleport üretici */}
      <div className="w-72 bg-dark-surface rounded-xl border border-dark-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">{t('teleport_code')}</h2>
        <div>
          <label className={labelClass}>{t('x_coord')}</label>
          <input type="number" className={inputClass} value={teleportInput.x}
            onChange={e => setTeleportInput(p => ({ ...p, x: e.target.value }))} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>{t('y_coord')}</label>
          <input type="number" className={inputClass} value={teleportInput.y}
            onChange={e => setTeleportInput(p => ({ ...p, y: e.target.value }))} placeholder="0" />
        </div>
        <button onClick={generateTeleport}
          className="w-full py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue text-sm transition-colors">
          {t('generate_teleport')}
        </button>
        {teleportCode && (
          <div className="bg-dark-bg rounded-lg border border-dark-border p-3">
            <p className="text-xs text-text-muted mb-2">{t('teleport_code')}:</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-cyber-green font-mono text-sm">{teleportCode}</code>
              <button onClick={copyTeleport}
                className="p-1.5 hover:bg-dark-hover rounded transition-colors">
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
            {copied && <p className="text-xs text-success mt-1">{t('copied')}</p>}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface rounded-xl border border-dark-border p-5 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-text-primary mb-4">{editingIdx !== null ? t('edit') : t('add_map')}</h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>{t('map_name')}</label>
                <input type="text" className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>X</label><input type="number" className={inputClass} value={form.x} onChange={e => setForm(p => ({ ...p, x: e.target.value }))} /></div>
                <div><label className={labelClass}>Y</label><input type="number" className={inputClass} value={form.y} onChange={e => setForm(p => ({ ...p, y: e.target.value }))} /></div>
                <div><label className={labelClass}>{t('width')}</label><input type="number" className={inputClass} value={form.width} onChange={e => setForm(p => ({ ...p, width: e.target.value }))} /></div>
                <div><label className={labelClass}>{t('height')}</label><input type="number" className={inputClass} value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} /></div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-sm hover:bg-dark-border transition-colors">{t('cancel')}</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg text-sm font-medium transition-colors disabled:opacity-40">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapTool;
