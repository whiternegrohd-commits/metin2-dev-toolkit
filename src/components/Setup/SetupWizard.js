import React, { useState } from 'react';
import {
  Database, Server, Folder, CheckCircle, AlertCircle,
  ArrowRight, ArrowLeft, Settings, Wifi, HardDrive
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function SetupWizard({ onComplete }) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    database: { host: 'localhost', port: 3306, user: 'root', password: '', database: 'metin2' },
    ftp: { host: '', port: 21, user: '', password: '', path: '/usr/metin2' },
    paths: { client: '', server: '', locale: 'tr' }
  });
  const [testResults, setTestResults] = useState({ database: null, ftp: null, paths: null });
  const [testing, setTesting] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);

  const steps = [
    { id: 'database', title: t('setup_db_title'), description: t('setup_db_desc'), icon: Database },
    { id: 'ftp', title: t('setup_ftp_title'), description: t('setup_ftp_desc'), icon: Server },
    { id: 'paths', title: t('setup_paths_title'), description: t('setup_paths_desc'), icon: Folder },
    { id: 'complete', title: t('setup_complete_title'), description: t('setup_complete_desc'), icon: CheckCircle }
  ];

  const testDatabaseConnection = async () => {
    setTesting(true);
    try {
      if (!ipcRenderer) {
        setTestResults(prev => ({ ...prev, database: { success: false, error: 'Electron ortamı gerekli' } }));
        return;
      }
      // Önce DB adı olmadan bağlan, sonra DB listesini çek
      const connConfig = { ...config.database, database: undefined };
      const result = await ipcRenderer.invoke('test-mysql-connection', config.database);
      setTestResults(prev => ({ ...prev, database: result }));
      if (result.success) {
        // Veritabanlarını otomatik çek
        setLoadingDbs(true);
        const dbResult = await ipcRenderer.invoke('list-databases', config.database);
        if (dbResult.success) setDatabases(dbResult.databases.filter(d => !['information_schema','performance_schema','mysql','sys'].includes(d)));
        setLoadingDbs(false);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, database: { success: false, error: error.message } }));
    } finally {
      setTesting(false);
    }
  };

  const testFTPConnection = async () => {
    setTesting(true);
    try {
      if (!ipcRenderer) {
        setTestResults(prev => ({ ...prev, ftp: { success: true, message: 'Mock FTP OK' } }));
        return;
      }
      const result = await ipcRenderer.invoke('test-ftp-connection', config.ftp);
      setTestResults(prev => ({ ...prev, ftp: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, ftp: { success: false, error: error.message } }));
    } finally {
      setTesting(false);
    }
  };

  const validatePaths = async () => {
    setTesting(true);
    try {
      if (!ipcRenderer) {
        setTestResults(prev => ({ ...prev, paths: { success: true, message: 'Mock paths OK' } }));
        return;
      }
      const result = await ipcRenderer.invoke('validate-paths', config.paths);
      setTestResults(prev => ({ ...prev, paths: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, paths: { success: false, error: error.message } }));
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    try {
      if (ipcRenderer) {
        await ipcRenderer.invoke('save-config', config);
      } else {
        localStorage.setItem('metin2-config', JSON.stringify(config));
      }
      onComplete(config);
    } catch (error) {
      console.error('Config save error:', error);
    }
  };

  const selectFolder = async (field) => {
    if (!ipcRenderer) return;
    const path = await ipcRenderer.invoke('select-folder');
    if (path) {
      setConfig(prev => ({ ...prev, paths: { ...prev.paths, [field]: path } }));
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return testResults.database?.success === true;
    return true;
  };

  const inputClass = "w-full px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-primary focus:border-cyber-green focus:outline-none";
  const labelClass = "block text-sm font-medium text-text-primary mb-2";

  const renderDatabaseStep = () => (
    <div className="space-y-4">
      <div className="p-3 bg-vivid-blue/5 border border-vivid-blue/20 rounded-lg text-xs text-vivid-blue">
        {t('setup_db_required')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('host')}</label>
          <input type="text" value={config.database.host} className={inputClass} placeholder="localhost"
            onChange={e => setConfig(p => ({ ...p, database: { ...p.database, host: e.target.value } }))} />
        </div>
        <div>
          <label className={labelClass}>{t('port')}</label>
          <input type="number" value={config.database.port} className={inputClass} placeholder="3306"
            onChange={e => setConfig(p => ({ ...p, database: { ...p.database, port: parseInt(e.target.value) } }))} />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('db_name')}</label>
        <input type="text" value={config.database.database} className={inputClass} placeholder="metin2"
          onChange={e => setConfig(p => ({ ...p, database: { ...p.database, database: e.target.value } }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('username')}</label>
          <input type="text" value={config.database.user} className={inputClass} placeholder="root"
            onChange={e => setConfig(p => ({ ...p, database: { ...p.database, user: e.target.value } }))} />
        </div>
        <div>
          <label className={labelClass}>{t('password')}</label>
          <input type="password" value={config.database.password} className={inputClass} placeholder="••••••••"
            onChange={e => setConfig(p => ({ ...p, database: { ...p.database, password: e.target.value } }))} />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={testDatabaseConnection} disabled={testing}
          className="flex items-center space-x-2 px-4 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue transition-colors disabled:opacity-50">
          <Wifi className="w-4 h-4" />
          <span>{testing ? t('setup_testing') : t('setup_test_db')}</span>
        </button>
        {testResults.database && (
          <div className={`flex items-center space-x-2 ${testResults.database.success ? 'text-success' : 'text-danger'}`}>
            {testResults.database.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.database.success ? t('setup_db_success') : testResults.database.error}</span>
          </div>
        )}
      </div>

      {/* Otomatik DB listesi */}
      {databases.length > 0 && (
        <div>
          <label className={labelClass}>Veritabanı Seç</label>
          <div className="grid grid-cols-3 gap-2">
            {databases.map(db => (
              <button key={db} onClick={() => setConfig(p => ({ ...p, database: { ...p.database, database: db } }))}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                  config.database.database === db
                    ? 'border-cyber-green bg-cyber-green/10 text-cyber-green'
                    : 'border-dark-border bg-dark-hover text-text-primary hover:border-cyber-green/40'
                }`}>
                {db}
              </button>
            ))}
          </div>
          {loadingDbs && <p className="text-xs text-text-muted mt-1">Veritabanları yükleniyor...</p>}
        </div>
      )}
    </div>
  );

  const renderFTPStep = () => (
    <div className="space-y-4">
      <div className="p-3 bg-dark-hover border border-dark-border rounded-lg text-xs text-text-muted">
        {t('setup_ftp_optional')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>FTP Host</label>
          <input type="text" value={config.ftp.host} className={inputClass} placeholder="ftp.yourserver.com"
            onChange={e => setConfig(p => ({ ...p, ftp: { ...p.ftp, host: e.target.value } }))} />
        </div>
        <div>
          <label className={labelClass}>{t('port')}</label>
          <input type="number" value={config.ftp.port} className={inputClass} placeholder="21"
            onChange={e => setConfig(p => ({ ...p, ftp: { ...p.ftp, port: parseInt(e.target.value) } }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('username')}</label>
          <input type="text" value={config.ftp.user} className={inputClass} placeholder="ftpuser"
            onChange={e => setConfig(p => ({ ...p, ftp: { ...p.ftp, user: e.target.value } }))} />
        </div>
        <div>
          <label className={labelClass}>{t('password')}</label>
          <input type="password" value={config.ftp.password} className={inputClass} placeholder="••••••••"
            onChange={e => setConfig(p => ({ ...p, ftp: { ...p.ftp, password: e.target.value } }))} />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('server_path')}</label>
        <input type="text" value={config.ftp.path} className={inputClass} placeholder="/usr/metin2"
          onChange={e => setConfig(p => ({ ...p, ftp: { ...p.ftp, path: e.target.value } }))} />
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={testFTPConnection} disabled={testing || !config.ftp.host}
          className="flex items-center space-x-2 px-4 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue transition-colors disabled:opacity-50">
          <Server className="w-4 h-4" />
          <span>{testing ? t('setup_testing') : t('setup_test_ftp')}</span>
        </button>
        {testResults.ftp && (
          <div className={`flex items-center space-x-2 ${testResults.ftp.success ? 'text-success' : 'text-danger'}`}>
            {testResults.ftp.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.ftp.success ? t('setup_ftp_success') : testResults.ftp.error}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPathsStep = () => (
    <div className="space-y-4">
      <div className="p-3 bg-dark-hover border border-dark-border rounded-lg text-xs text-text-muted">
        {t('setup_paths_optional')}
      </div>
      <div>
        <label className={labelClass}>{t('client_path')}</label>
        <div className="flex space-x-2">
          <input type="text" value={config.paths.client} className={`${inputClass} flex-1`} placeholder="C:/Metin2/Client"
            onChange={e => setConfig(p => ({ ...p, paths: { ...p.paths, client: e.target.value } }))} />
          <button onClick={() => selectFolder('client')}
            className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('server_path')}</label>
        <div className="flex space-x-2">
          <input type="text" value={config.paths.server} className={`${inputClass} flex-1`} placeholder="C:/Metin2/Server"
            onChange={e => setConfig(p => ({ ...p, paths: { ...p.paths, server: e.target.value } }))} />
          <button onClick={() => selectFolder('server')}
            className="px-3 py-2 bg-dark-hover border border-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <label className={labelClass}>{t('locale')}</label>
        <select value={config.paths.locale} className={inputClass}
          onChange={e => setConfig(p => ({ ...p, paths: { ...p.paths, locale: e.target.value } }))}>
          <option value="tr">Türkçe (TR)</option>
          <option value="en">English (EN)</option>
          <option value="de">Deutsch (DE)</option>
          <option value="fr">Français (FR)</option>
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={validatePaths} disabled={testing || (!config.paths.client && !config.paths.server)}
          className="flex items-center space-x-2 px-4 py-2 bg-vivid-blue/10 hover:bg-vivid-blue/20 border border-vivid-blue/30 rounded-lg text-vivid-blue transition-colors disabled:opacity-50">
          <Folder className="w-4 h-4" />
          <span>{testing ? t('setup_validating') : t('setup_validate_paths')}</span>
        </button>
        {testResults.paths && (
          <div className={`flex items-center space-x-2 ${testResults.paths.success ? 'text-success' : 'text-danger'}`}>
            {testResults.paths.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.paths.success ? t('setup_paths_success') : testResults.paths.error}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary">{t('setup_complete_title')}!</h3>
      <p className="text-text-muted">{t('setup_complete_msg')}</p>
      <div className="bg-dark-hover rounded-lg p-4 text-left">
        <h4 className="font-medium text-text-primary mb-2">{t('setup_configured')}</h4>
        <ul className="space-y-1 text-sm text-text-muted">
          <li>✅ MySQL: {config.database.host}:{config.database.port}/{config.database.database}</li>
          <li>{config.ftp.host ? `✅ FTP: ${config.ftp.host}` : `⚪ FTP: ${t('setup_not_configured')}`}</li>
          <li>{config.paths.client ? `✅ Client: ${config.paths.client}` : `⚪ Client: ${t('setup_not_configured')}`}</li>
          <li>{config.paths.server ? `✅ Server: ${config.paths.server}` : `⚪ Server: ${t('setup_not_configured')}`}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-dark-bg/98 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-surface rounded-xl border border-dark-border p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
            <Settings className="w-6 h-6 text-cyber-green" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{t('setup_title')}</h2>
            <p className="text-text-muted">{t('setup_subtitle')}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                index < currentStep ? 'border-cyber-green bg-cyber-green/20 text-cyber-green' :
                index === currentStep ? 'border-cyber-green bg-cyber-green/10 text-cyber-green' :
                'border-dark-border text-text-muted'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-colors ${index < currentStep ? 'bg-cyber-green' : 'bg-dark-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-text-primary mb-1">{steps[currentStep].title}</h3>
          <p className="text-text-muted mb-6">{steps[currentStep].description}</p>
          {currentStep === 0 && renderDatabaseStep()}
          {currentStep === 1 && renderFTPStep()}
          {currentStep === 2 && renderPathsStep()}
          {currentStep === 3 && renderCompleteStep()}
        </div>

        {/* Actions - "Atla" butonu YOK */}
        <div className="flex items-center justify-end space-x-3">
          {currentStep > 0 && currentStep < 3 && (
            <button onClick={() => setCurrentStep(p => p - 1)}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border rounded-lg text-text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('setup_back')}</span>
            </button>
          )}
          {currentStep < 3 ? (
            <button onClick={() => setCurrentStep(p => p + 1)} disabled={!canProceed()}
              className="flex items-center space-x-2 px-4 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 rounded-lg text-cyber-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <span>{t('setup_next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={saveConfig}
              className="flex items-center space-x-2 px-6 py-2 bg-cyber-green hover:bg-cyber-green/80 rounded-lg text-dark-bg font-medium transition-colors">
              <CheckCircle className="w-4 h-4" />
              <span>{t('setup_finish')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SetupWizard;
