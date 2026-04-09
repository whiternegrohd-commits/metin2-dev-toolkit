import React, { useState, useEffect } from 'react';
import { X, Database, Server, Folder, Globe, CheckCircle, AlertCircle, Wifi, HardDrive, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function SettingsModal({ config, onClose, onSave }) {
  const { t, lang, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('database');
  const [localConfig, setLocalConfig] = useState(config || {
    database: { host: 'localhost', port: 3306, user: 'root', password: '', database: 'metin2' },
    ftp: { host: '', port: 21, user: '', password: '', path: '/usr/metin2' },
    paths: { client: '', server: '', locale: 'tr' }
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const inputClass = "w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-text-muted mb-1";

  const testDB = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (!ipcRenderer) { setTestResult({ success: false, error: 'Electron gerekli' }); return; }
      const r = await ipcRenderer.invoke('test-mysql-connection', localConfig.database);
      setTestResult(r);
    } catch (e) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const testFTP = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (!ipcRenderer) { setTestResult({ success: false, error: 'Electron gerekli' }); return; }
      const r = await ipcRenderer.invoke('test-ftp-connection', localConfig.ftp);
      setTestResult(r);
    } catch (e) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const selectFolder = async (field) => {
    if (!ipcRenderer) return;
    const path = await ipcRenderer.invoke('select-folder');
    if (path) setLocalConfig(p => ({ ...p, paths: { ...p.paths, [field]: path } }));
  };

  const handleSave = async () => {
    try {
      if (ipcRenderer) await ipcRenderer.invoke('save-config', localConfig);
      else localStorage.setItem('metin2-config', JSON.stringify(localConfig));
      onSave(localConfig);
      setSaveMsg({ ok: true });
      setTimeout(() => { setSaveMsg(null); onClose(); }, 1200);
    } catch (e) {
      setSaveMsg({ ok: false, msg: e.message });
    }
  };

  const handleReset = () => {
    if (!window.confirm(t('reset_confirm'))) return;
    if (ipcRenderer) ipcRenderer.invoke('save-config', null).catch(() => {});
    localStorage.removeItem('metin2-config');
    localStorage.removeItem('metin2-lang');
    window.location.reload();
  };

  const tabs = [
    { id: 'database', label: t('db_settings'), icon: Database },
    { id: 'ftp', label: t('ftp_settings'), icon: Server },
    { id: 'paths', label: t('path_settings'), icon: Folder },
    { id: 'language', label: t('language_settings'), icon: Globe },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-surface rounded-xl border border-dark-border w-full max-w-xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-text-primary">{t('settings')}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-border px-5">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setTestResult(null); }}
              className={`flex items-center space-x-1.5 px-3 py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyber-green text-cyber-green'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'database' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('host')}</label>
                  <input type="text" className={inputClass} value={localConfig.database?.host || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, database: { ...p.database, host: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelClass}>{t('port')}</label>
                  <input type="number" className={inputClass} value={localConfig.database?.port || 3306}
                    onChange={e => setLocalConfig(p => ({ ...p, database: { ...p.database, port: parseInt(e.target.value) } }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('db_name')}</label>
                <input type="text" className={inputClass} value={localConfig.database?.database || ''}
                  onChange={e => setLocalConfig(p => ({ ...p, database: { ...p.database, database: e.target.value } }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('username')}</label>
                  <input type="text" className={inputClass} value={localConfig.database?.user || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, database: { ...p.database, user: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelClass}>{t('password')}</label>
                  <input type="password" className={inputClass} value={localConfig.database?.password || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, database: { ...p.database, password: e.target.value } }))} />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={testDB} disabled={testing}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue text-sm transition-colors disabled:opacity-50">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{testing ? t('setup_testing') : t('test_connection')}</span>
                </button>
                {testResult && (
                  <div className={`flex items-center space-x-1.5 text-sm ${testResult.success ? 'text-success' : 'text-danger'}`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.success ? t('setup_db_success') : testResult.error}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'ftp' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>FTP Host</label>
                  <input type="text" className={inputClass} value={localConfig.ftp?.host || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, ftp: { ...p.ftp, host: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelClass}>{t('port')}</label>
                  <input type="number" className={inputClass} value={localConfig.ftp?.port || 21}
                    onChange={e => setLocalConfig(p => ({ ...p, ftp: { ...p.ftp, port: parseInt(e.target.value) } }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('username')}</label>
                  <input type="text" className={inputClass} value={localConfig.ftp?.user || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, ftp: { ...p.ftp, user: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelClass}>{t('password')}</label>
                  <input type="password" className={inputClass} value={localConfig.ftp?.password || ''}
                    onChange={e => setLocalConfig(p => ({ ...p, ftp: { ...p.ftp, password: e.target.value } }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('server_path')}</label>
                <input type="text" className={inputClass} value={localConfig.ftp?.path || ''}
                  onChange={e => setLocalConfig(p => ({ ...p, ftp: { ...p.ftp, path: e.target.value } }))} />
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={testFTP} disabled={testing || !localConfig.ftp?.host}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue text-sm transition-colors disabled:opacity-50">
                  <Server className="w-3.5 h-3.5" />
                  <span>{testing ? t('setup_testing') : t('setup_test_ftp')}</span>
                </button>
                {testResult && (
                  <div className={`flex items-center space-x-1.5 text-sm ${testResult.success ? 'text-success' : 'text-danger'}`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.success ? t('setup_ftp_success') : testResult.error}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'paths' && (
            <>
              <div>
                <label className={labelClass}>{t('client_path')}</label>
                <div className="flex space-x-2">
                  <input type="text" className={`${inputClass} flex-1`} value={localConfig.paths?.client || ''}
                    placeholder="C:/Metin2/Client"
                    onChange={e => setLocalConfig(p => ({ ...p, paths: { ...p.paths, client: e.target.value } }))} />
                  <button onClick={() => selectFolder('client')}
                    className="px-2.5 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                    <HardDrive className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('server_path')}</label>
                <div className="flex space-x-2">
                  <input type="text" className={`${inputClass} flex-1`} value={localConfig.paths?.server || ''}
                    placeholder="C:/Metin2/Server"
                    onChange={e => setLocalConfig(p => ({ ...p, paths: { ...p.paths, server: e.target.value } }))} />
                  <button onClick={() => selectFolder('server')}
                    className="px-2.5 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                    <HardDrive className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('locale')}</label>
                <select className={inputClass} value={localConfig.paths?.locale || 'tr'}
                  onChange={e => setLocalConfig(p => ({ ...p, paths: { ...p.paths, locale: e.target.value } }))}>
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (EN)</option>
                  <option value="de">Deutsch (DE)</option>
                  <option value="fr">Français (FR)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'language' && (
            <div className="space-y-3">
              <p className="text-sm text-text-muted">{t('language')}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: 'tr', label: '🇹🇷 Türkçe' },
                  { code: 'en', label: '🇬🇧 English' }
                ].map(l => (
                  <button key={l.code} onClick={() => setLanguage(l.code)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      lang === l.code
                        ? 'border-cyber-green bg-cyber-green/10 text-cyber-green'
                        : 'border-dark-border bg-dark-hover text-text-primary hover:border-cyber-green/40'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-dark-border">
                <button onClick={handleReset}
                  className="flex items-center space-x-2 px-3 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/30 rounded-lg text-danger text-sm transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('reset_settings')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-dark-border">
          {saveMsg ? (
            <div className={`flex items-center space-x-2 text-sm ${saveMsg.ok ? 'text-success' : 'text-danger'}`}>
              {saveMsg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{saveMsg.ok ? t('settings_saved') : saveMsg.msg}</span>
            </div>
          ) : <div />}
          <div className="flex space-x-2">
            <button onClick={onClose}
              className="px-4 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-text-primary text-sm transition-colors">
              {t('cancel')}
            </button>
            <button onClick={handleSave}
              className="px-4 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg text-sm font-medium transition-colors">
              {t('save_settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
