
import React, { useState } from 'react';
import { FileText, Search, Save, Upload, RefreshCw, AlertCircle, CheckCircle, Code, Database as DatabaseIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import XMLEditor from './XMLEditor';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function parseXML(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const items = doc.querySelectorAll('Item, item');
  if (items.length === 0) return null;
  const headers = [];
  const rows = [];
  items.forEach((item, i) => {
    const attrs = {};
    item.getAttributeNames().forEach(a => { attrs[a] = item.getAttribute(a); });
    item.querySelectorAll('*').forEach(child => { attrs[child.tagName] = child.textContent.trim(); });
    if (i === 0) Object.keys(attrs).forEach(k => headers.push(k));
    rows.push(headers.map(h => attrs[h] || ''));
  });
  return { headers, rows };
}

function rowsToXML(headers, rows) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<ItemList>'];
  rows.forEach(row => {
    const attrs = headers.map((h, i) => `${h}="${(row[i] || '').replace(/"/g, '&quot;')}"`).join(' ');
    lines.push(`\t<Item ${attrs}/>`);
  });
  lines.push('</ItemList>');
  return lines.join('\n');
}

function ProtoEditor() {
  const { t } = useLanguage();
  const [activeProto, setActiveProto] = useState('item');
  const [fileFormat, setFileFormat] = useState('txt');
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [status, setStatus] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const showStatus = (ok, msg) => { setStatus({ ok, msg }); setTimeout(() => setStatus(null), 3000); };

  const loadFile = async () => {
    if (!ipcRenderer) {
      setHeaders(['vnum', 'name', 'type', 'subtype', 'size', 'price']);
      setRows([['10','Kılıç +0','1','0','1','1000'],['20','Hançer +0','1','1','1','800'],['11001','Zırh +0','2','0','1','2000']]);
      setFilePath('mock/item_proto.txt');
      return;
    }
    const isXML = fileFormat === 'xml';
    const filters = isXML
      ? [{ name: 'XML Proto', extensions: ['xml'] }]
      : activeProto === 'item' ? [{ name: 'Item Proto', extensions: ['txt'] }] : [{ name: 'Mob Proto', extensions: ['txt'] }];
    const path = await ipcRenderer.invoke('select-file', filters);
    if (!path) return;
    setLoading(true);
    try {
      const result = await ipcRenderer.invoke('read-file', path);
      if (!result.success) { showStatus(false, result.error); return; }
      if (isXML) {
        const parsed = parseXML(result.data);
        if (!parsed) { showStatus(false, 'XML parse hatası'); return; }
        setHeaders(parsed.headers);
        setRows(parsed.rows);
      } else {
        const lines = result.data.split('\n').filter(l => l.trim());
        if (!lines.length) return;
        const parsed = lines.map(l => l.split('\t'));
        const firstCell = parsed[0][0]?.trim();
        if (isNaN(firstCell)) {
          setHeaders(parsed[0].map(h => h.trim()));
          setRows(parsed.slice(1).map(r => r.map(c => c?.trim() || '')));
        } else {
          setHeaders(parsed[0].map((_, i) => `col_${i}`));
          setRows(parsed.map(r => r.map(c => c?.trim() || '')));
        }
      }
      setFilePath(path);
      showStatus(true, 'Dosya yüklendi ✓');
    } catch (e) { showStatus(false, e.message); }
    finally { setLoading(false); }
  };

  const saveFile = async () => {
    if (!filePath || !rows.length) return;
    setLoading(true);
    try {
      const content = fileFormat === 'xml'
        ? rowsToXML(headers, rows)
        : (headers[0] !== 'col_0' ? [headers.join('\t'), ...rows.map(r => r.join('\t'))] : rows.map(r => r.join('\t'))).join('\n') + '\n';
      if (!ipcRenderer) { showStatus(true, 'Kaydedildi (mock)'); return; }
      const result = await ipcRenderer.invoke('write-file', filePath, content);
      showStatus(result.success, result.success ? 'Kaydedildi ✓' : result.error);
    } catch (e) { showStatus(false, e.message); }
    finally { setLoading(false); }
  };

  const loadFromDB = async () => {
    if (!ipcRenderer) return;
    setLoading(true);
    try {
      // config'i database.js'den al
      const cfg = (await import('../../utils/database')).default.getConfig();
      if (!cfg) { showStatus(false, 'DB config yok, önce Setup yapın'); return; }
      const result = await ipcRenderer.invoke('get-items-from-db', cfg, '', 2000);
      if (!result.success) { showStatus(false, result.error); return; }
      if (result.data.length === 0) { showStatus(false, 'item_proto tablosu boş veya bulunamadı'); return; }
      const cols = Object.keys(result.data[0]);
      setHeaders(cols);
      setRows(result.data.map(row => cols.map(c => String(row[c] ?? ''))));
      setFilePath('DB: item_proto');
      setFileFormat('txt');
      showStatus(true, `${result.data.length} item yüklendi ✓`);
    } catch (e) { showStatus(false, e.message); }
    finally { setLoading(false); }
  };
  const commitEdit = () => {
    if (!editingCell) return;
    setRows(rows.map((r, ri) => ri === editingCell.rowIdx ? r.map((c, ci) => ci === editingCell.colIdx ? editValue : c) : r));
    setEditingCell(null);
  };

  const filtered = rows.filter(r => r.some(c => String(c).toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 px-5 pt-5">
        <button
          onClick={() => setActiveProto('item')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeProto === 'item'
              ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
              : 'bg-dark-surface border border-dark-border text-text-muted hover:text-text-primary'
          }`}
        >
          Proto Editor
        </button>
        <button
          onClick={() => setActiveProto('xml')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeProto === 'xml'
              ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
              : 'bg-dark-surface border border-dark-border text-text-muted hover:text-text-primary'
          }`}
        >
          XML Editor
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5 min-h-0">
        {activeProto === 'xml' ? (
          <XMLEditor />
        ) : (
          <div className="h-full flex flex-col bg-dark-surface rounded-xl border border-dark-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-vivid-blue/10 rounded-lg border border-vivid-blue/20">
                  <FileText className="w-5 h-5 text-vivid-blue" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">{t('proto_editor_title')}</h1>
                  {filePath && <p className="text-xs text-text-muted font-mono">{filePath}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex bg-dark-hover rounded-lg border border-dark-border p-0.5">
                  {['item', 'mob'].map(type => (
                    <button key={type} onClick={() => { setActiveProto(type); setRows([]); setHeaders([]); setFilePath(''); setFileFormat('txt'); }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeProto === type ? 'bg-vivid-blue/20 text-vivid-blue' : 'text-text-muted hover:text-text-primary'}`}>
                      {type === 'item' ? t('item_proto') : t('mob_proto')}
                    </button>
                  ))}
                </div>
                {activeProto === 'item' && (
                  <div className="flex bg-dark-hover rounded-lg border border-dark-border p-0.5">
                    {['txt', 'xml'].map(fmt => (
                      <button key={fmt} onClick={() => { setFileFormat(fmt); setRows([]); setHeaders([]); setFilePath(''); }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${fileFormat === fmt ? 'bg-cyber-green/20 text-cyber-green' : 'text-text-muted hover:text-text-primary'}`}>
                        {fmt === 'xml' && <Code className="w-3 h-3" />}
                        <span>.{fmt}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={loadFile} disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue text-sm transition-colors">
                  <Upload className="w-3.5 h-3.5" /><span>{t('load_file')}</span>
                </button>
                <button onClick={loadFromDB} disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-sm transition-colors">
                  <DatabaseIcon className="w-3.5 h-3.5" /><span>DB'den Yükle</span>
                </button>
                {rows.length > 0 && (
                  <button onClick={saveFile} disabled={loading}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green text-sm transition-colors">
                    <Save className="w-3.5 h-3.5" /><span>{t('save_file')}</span>
                  </button>
                )}
              </div>
            </div>

            {status && (
              <div className={`flex items-center space-x-2 p-2.5 rounded-lg border mb-3 text-sm ${status.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                {status.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{status.msg}</span>
              </div>
            )}

            {rows.length > 0 ? (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_items')}
                    className="w-full pl-9 pr-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:border-cyber-green focus:outline-none text-sm" />
                </div>
                <div className="flex-1 overflow-auto rounded-lg border border-dark-border">
                  <table className="w-full text-xs">
                    <thead className="bg-dark-hover sticky top-0 z-10">
                      <tr>{headers.map((h, i) => <th key={i} className="text-left px-3 py-2.5 font-medium text-text-muted uppercase tracking-wider whitespace-nowrap border-r border-dark-border last:border-r-0">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {loading ? <tr><td colSpan={headers.length} className="text-center py-8 text-text-muted">{t('loading')}</td></tr>
                        : filtered.map((row, ri) => (
                          <tr key={ri} className="border-t border-dark-border hover:bg-dark-hover transition-colors">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-2 border-r border-dark-border last:border-r-0"
                                onDoubleClick={() => startEdit(rows.indexOf(row), ci, cell)}>
                                {editingCell?.rowIdx === rows.indexOf(row) && editingCell?.colIdx === ci ? (
                                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                                    onBlur={commitEdit} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                                    className="w-full bg-dark-bg border border-cyber-green rounded px-1 py-0.5 text-text-primary focus:outline-none text-xs font-mono" />
                                ) : <span className={`font-mono ${ci === 0 ? 'text-cyber-green' : 'text-text-primary'}`}>{cell}</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-text-muted mt-2">{filtered.length} / {rows.length} — Çift tıkla düzenle · {fileFormat.toUpperCase()} format</p>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {loading ? <RefreshCw className="w-10 h-10 text-text-muted mx-auto mb-3 animate-spin" /> : <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />}
                  <p className="text-text-muted text-sm">{loading ? t('loading') : t('no_file_loaded')}</p>
                  {!loading && <p className="text-text-muted text-xs mt-1">{fileFormat === 'xml' ? 'item_proto.xml yükle' : t('load_proto_hint')}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtoEditor;
