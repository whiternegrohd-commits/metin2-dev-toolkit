import React, { useState } from 'react';
import { Palette, Scissors, Code, Upload, Save, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function UITools() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('sub');
  const [subContent, setSubContent] = useState('');
  const [subPath, setSubPath] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptPath, setScriptPath] = useState('');
  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const showStatus = (ok, msg) => {
    setStatus({ ok, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const loadSub = async () => {
    if (!ipcRenderer) {
      setSubContent('# Mock .sub file\nSprite\t0\t0\t64\t64\t"icon/item/1.tga"\nSprite\t64\t0\t64\t64\t"icon/item/2.tga"');
      setSubPath('mock/ui.sub');
      return;
    }
    const path = await ipcRenderer.invoke('select-file', [{ name: 'Sub Files', extensions: ['sub', 'txt'] }]);
    if (!path) return;
    const result = await ipcRenderer.invoke('read-file', path);
    if (result.success) { setSubContent(result.data); setSubPath(path); }
    else showStatus(false, result.error);
  };

  const saveSub = async () => {
    if (!subPath) return;
    if (!ipcRenderer) { showStatus(true, 'Kaydedildi (mock)'); return; }
    const result = await ipcRenderer.invoke('write-file', subPath, subContent);
    showStatus(result.success, result.success ? 'Kaydedildi ✓' : result.error);
  };

  const loadScript = async () => {
    if (!ipcRenderer) {
      setScriptContent('import ui\n\nclass MyWindow(ui.Window):\n    def __init__(self):\n        ui.Window.__init__(self)\n        self.SetSize(200, 100)\n');
      setScriptPath('mock/uiscript.py');
      return;
    }
    const path = await ipcRenderer.invoke('select-file', [{ name: 'Python/Script', extensions: ['py', 'txt'] }]);
    if (!path) return;
    const result = await ipcRenderer.invoke('read-file', path);
    if (result.success) { setScriptContent(result.data); setScriptPath(path); }
    else showStatus(false, result.error);
  };

  const saveScript = async () => {
    if (!scriptPath) return;
    if (!ipcRenderer) { showStatus(true, 'Kaydedildi (mock)'); return; }
    const result = await ipcRenderer.invoke('write-file', scriptPath, scriptContent);
    showStatus(result.success, result.success ? 'Kaydedildi ✓' : result.error);
  };

  const copyContent = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // .sub dosyasını parse et - sprite satırlarını çıkar
  const parseSubSprites = () => {
    if (!subContent) return [];
    return subContent.split('\n')
      .filter(l => l.trim().toLowerCase().startsWith('sprite'))
      .map((l, i) => {
        const parts = l.trim().split(/\s+/);
        return { idx: i, x: parts[1] || '0', y: parts[2] || '0', w: parts[3] || '0', h: parts[4] || '0', file: parts[5] || '' };
      });
  };

  const sprites = parseSubSprites();

  const tabs = [
    { id: 'sub', label: t('sub_slicer'), icon: Scissors },
    { id: 'script', label: t('uiscript_editor'), icon: Code }
  ];

  return (
    <div className="h-full flex flex-col bg-dark-surface rounded-xl border border-dark-border p-5">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
          <Palette className="w-5 h-5 text-cyber-green" />
        </div>
        <h1 className="text-base font-semibold text-text-primary">{t('ui_tools_title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
                : 'bg-dark-hover border border-dark-border text-text-muted hover:text-text-primary'
            }`}>
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {status && (
        <div className={`flex items-center space-x-2 p-2.5 rounded-lg border mb-3 text-sm ${
          status.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
        }`}>
          {status.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{status.msg}</span>
        </div>
      )}

      {activeTab === 'sub' && (
        <div className="flex-1 flex space-x-4 min-h-0">
          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted font-mono">{subPath || t('no_file_loaded')}</p>
              <div className="flex items-center space-x-2">
                <button onClick={loadSub}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-xs transition-colors hover:bg-dark-border">
                  <Upload className="w-3 h-3" />
                  <span>{t('load_sub')}</span>
                </button>
                {subContent && (
                  <>
                    <button onClick={saveSub}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyber-green/10 border border-cyber-green/30 rounded-lg text-cyber-green text-xs transition-colors hover:bg-cyber-green/20">
                      <Save className="w-3 h-3" />
                      <span>{t('save_file')}</span>
                    </button>
                    <button onClick={() => copyContent(subContent)}
                      className="p-1.5 hover:bg-dark-hover rounded transition-colors">
                      <Copy className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea value={subContent} onChange={e => setSubContent(e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg p-3 text-text-primary font-mono text-xs focus:border-cyber-green focus:outline-none resize-none"
              placeholder="# .sub dosyasını yükle veya buraya yapıştır..." />
          </div>

          {/* Sprite listesi */}
          {sprites.length > 0 && (
            <div className="w-64 flex flex-col">
              <p className="text-xs font-medium text-text-muted mb-2">{sprites.length} Sprite</p>
              <div className="flex-1 overflow-auto rounded-lg border border-dark-border">
                <table className="w-full text-xs">
                  <thead className="bg-dark-hover sticky top-0">
                    <tr>
                      {['#', 'X', 'Y', 'W', 'H'].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-text-muted font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sprites.map(s => (
                      <tr key={s.idx} className="border-t border-dark-border hover:bg-dark-hover">
                        <td className="px-2 py-1.5 text-text-muted">{s.idx}</td>
                        <td className="px-2 py-1.5 text-cyber-green font-mono">{s.x}</td>
                        <td className="px-2 py-1.5 text-cyber-green font-mono">{s.y}</td>
                        <td className="px-2 py-1.5 text-text-primary font-mono">{s.w}</td>
                        <td className="px-2 py-1.5 text-text-primary font-mono">{s.h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'script' && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted font-mono">{scriptPath || t('no_file_loaded')}</p>
            <div className="flex items-center space-x-2">
              <button onClick={loadScript}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-hover border border-dark-border rounded-lg text-text-primary text-xs transition-colors hover:bg-dark-border">
                <Upload className="w-3 h-3" />
                <span>{t('load_script')}</span>
              </button>
              {scriptContent && (
                <>
                  <button onClick={saveScript}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyber-green/10 border border-cyber-green/30 rounded-lg text-cyber-green text-xs transition-colors hover:bg-cyber-green/20">
                    <Save className="w-3 h-3" />
                    <span>{t('save_file')}</span>
                  </button>
                  <button onClick={() => copyContent(scriptContent)}
                    className="p-1.5 hover:bg-dark-hover rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea value={scriptContent} onChange={e => setScriptContent(e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg p-3 text-text-primary font-mono text-xs focus:border-cyber-green focus:outline-none resize-none"
            placeholder="# Python UIScript dosyasını yükle veya buraya yaz..." />
          {copied && <p className="text-xs text-success mt-1">{t('copied')}</p>}
        </div>
      )}
    </div>
  );
}

export default UITools;
