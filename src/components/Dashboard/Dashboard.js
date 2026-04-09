import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, FileText, Scroll, Map, Palette, Activity,
  Users, Server, Database as DatabaseIcon, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import Database from '../../utils/database';
import { useLanguage } from '../../context/LanguageContext';

const { ipcRenderer } = window.require ? window.require('electron') : {};

function Dashboard({ config }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const moduleCards = [
    { id: 'shop-manager', title: t('shop_manager'), description: 'NPC dükkanlarını yönet, item sürükle-bırak ile düzenle', icon: ShoppingCart, color: 'cyber-green', path: '/shop-manager', features: ['NPC & Mount Editor', 'Drag & Drop', 'SQL Integration'] },
    { id: 'proto-editor', title: t('proto_editor'), description: 'Item ve Mob proto dosyalarını düzenle', icon: FileText, color: 'vivid-blue', path: '/proto-editor', features: ['Toplu Güncelleme', 'Gelişmiş Filtreleme', 'Çift tıkla düzenle'] },
    { id: 'quest-generator', title: t('quest_generator'), description: 'Lua quest dosyaları oluştur ve kaydet', icon: Scroll, color: 'cyber-green', path: '/quest-generator', features: ['Kill / Delivery / Collection', 'Lua Export', 'Hazır Şablonlar'] },
    { id: 'map-tool', title: t('map_tool'), description: 'atlasinfo.txt yönetimi ve teleport kodu üretici', icon: Map, color: 'vivid-blue', path: '/map-tool', features: ['AtlasInfo Editörü', 'Teleport Kodu', 'Harita Yönetimi'] },
    { id: 'ui-tools', title: t('ui_tools'), description: 'Sub dosyaları ve UIScript editörü', icon: Palette, color: 'cyber-green', path: '/ui-tools', features: ['Sub Slicer', 'Sprite Listesi', 'Python Editor'] },
    { id: 'log-analyzer', title: t('log_analyzer'), description: 'Syslog ve syserr dosyalarını anlık takip et', icon: Activity, color: 'warning', path: '/log-analyzer', features: ['Gerçek Zamanlı İzleme', 'Hata Kategorileri', 'Filtreler'] }
  ];
  const [stats, setStats] = useState({
    activeProjects: 0, totalItems: 0, questCount: 0, onlinePlayers: 0, activities: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Her 30 saniyede güncelle
    return () => clearInterval(interval);
  }, [config]);

  const loadDashboardData = async () => {
    if (!config?.database) {
      setStats({ activeProjects: 0, totalItems: 0, questCount: 0, onlinePlayers: 0 });
      setLoading(false);
      return;
    }

    try {
      // item_proto sayısı
      const itemsResult = await Database.query('SELECT COUNT(*) as count FROM item_proto');
      const totalItems = itemsResult.success ? (Number(itemsResult.data[0]?.count) || 0) : 0;

      // Online oyuncu - farklı kolon adlarını dene
      let onlinePlayers = 0;
      for (const q of [
        'SELECT COUNT(*) as count FROM player WHERE logoff_time = 0',
        'SELECT COUNT(*) as count FROM player WHERE online = 1',
        'SELECT COUNT(*) as count FROM player WHERE last_play > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
      ]) {
        const r = await Database.query(q);
        if (r.success) { onlinePlayers = Number(r.data[0]?.count) || 0; break; }
      }

      // Quest sayısı - tablo yoksa 0
      let questCount = 0;
      const qr = await Database.query('SELECT COUNT(*) as count FROM quest');
      if (qr.success) questCount = Number(qr.data[0]?.count) || 0;

      // Aktif dükkan sayısı
      let shopCount = 0;
      for (const q of [
        'SELECT COUNT(DISTINCT npc_vnum) as count FROM shop',
        'SELECT COUNT(*) as count FROM player_shop',
      ]) {
        const r = await Database.query(q);
        if (r.success) { shopCount = Number(r.data[0]?.count) || 0; break; }
      }

      // Gerçek aktiviteler
      let activities = [];
      if (ipcRenderer) {
        const actResult = await ipcRenderer.invoke('get-recent-activity', config.database);
        if (actResult.success) activities = actResult.activities;
      }

      setStats({ activeProjects: shopCount, totalItems, questCount, onlinePlayers, activities });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setStats({ activeProjects: 0, totalItems: 0, questCount: 0, onlinePlayers: 0 });
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { label: 'Aktif Dükkan', value: stats.activeProjects.toString(), icon: Server, color: 'cyber-green' },
    { label: t('total_items'), value: stats.totalItems.toLocaleString(), icon: DatabaseIcon, color: 'vivid-blue' },
    { label: t('quest_count'), value: stats.questCount.toLocaleString(), icon: Scroll, color: 'cyber-green' },
    { label: t('online_players'), value: stats.onlinePlayers.toString(), icon: Users, color: 'warning' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyber-green/10 to-vivid-blue/10 border border-cyber-green/20 rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          🚀 Metin2 Dev Toolkit - LIVE UPDATE TEST
        </h1>
        <p className="text-text-muted">
          ✅ Güncelleme sistemi çalışıyor! Yeni versiyon indir ve yeniden başlat.
        </p>
      </div>
      <div className="bg-gradient-to-r from-dark-surface to-dark-hover rounded-xl p-6 border border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {t('welcome')} 🚀
            </h1>
            <p className="text-text-secondary">
              {t('welcome_sub')}
            </p>
            {config && (
              <div className="mt-2 text-xs text-text-muted">
                Database: {config.database?.host}:{config.database?.port} | {t('last_update')}: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
              title="Verileri Yenile"
            >
              <RefreshCw className={`w-5 h-5 text-cyber-green ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Zap className="w-8 h-8 text-cyber-green animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-dark-surface rounded-lg p-4 border border-dark-border hover:border-cyber-green/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color} ${loading ? 'animate-pulse' : ''}`}>
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleCards.map((module) => (
          <div
            key={module.id}
            className="module-card rounded-xl p-6 cursor-pointer group"
            onClick={() => navigate(module.path)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${module.color}/10 border border-${module.color}/20`}>
                <module.icon className={`w-6 h-6 text-${module.color}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-cyber-green transition-colors" />
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {module.title}
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              {module.description}
            </p>

            <div className="space-y-2">
              {module.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${module.color}`} />
                  <span className="text-xs text-text-muted">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-dark-border">
              <button className={`text-${module.color} text-sm font-medium hover:underline`}>
                {t('open_module')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('recent_activity')}</h2>
        <div className="space-y-3">
          {stats.activities && stats.activities.length > 0 ? stats.activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-hover transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                activity.type === 'success' ? 'bg-success' :
                activity.type === 'warning' ? 'bg-warning' : 'bg-vivid-blue'
              }`} />
              <p className="text-text-primary text-sm">{activity.action}</p>
            </div>
          )) : (
            <p className="text-text-muted text-sm text-center py-4">Aktivite bulunamadı</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;