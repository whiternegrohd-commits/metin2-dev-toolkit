import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  FileText, 
  Scroll, 
  Map, 
  Palette, 
  Activity,
  TrendingUp,
  Users,
  Server,
  Database,
  ArrowRight,
  Zap
} from 'lucide-react';

const moduleCards = [
  {
    id: 'shop-manager',
    title: 'Shop Manager',
    description: 'NPC dükkanlarını yönet, item sürükle-bırak ile düzenle',
    icon: ShoppingCart,
    color: 'cyber-green',
    path: '/shop-manager',
    features: ['3D NPC Preview', 'Drag & Drop', 'SQL Integration']
  },
  {
    id: 'proto-editor',
    title: 'Proto Editor',
    description: 'Item ve Mob proto dosyalarını düzenle',
    icon: FileText,
    color: 'vivid-blue',
    path: '/proto-editor',
    features: ['Toplu Güncelleme', 'Gelişmiş Filtreleme', 'SQL/Client Sync']
  },
  {
    id: 'quest-generator',
    title: 'Quest Generator',
    description: 'Görsel blok editörü ile Lua quest yazımı',
    icon: Scroll,
    color: 'cyber-green',
    path: '/quest-generator',
    features: ['Visual Scripting', 'Hazır Şablonlar', 'Lua Export']
  },
  {
    id: 'map-tool',
    title: 'Map Tool',
    description: 'Harita koordinatları ve atlasinfo yönetimi',
    icon: Map,
    color: 'vivid-blue',
    path: '/map-tool',
    features: ['Koordinat Görselleştirme', 'Teleport Kodları', 'AtlasInfo Sync']
  },
  {
    id: 'ui-tools',
    title: 'UI Tools',
    description: 'Sub dosyaları ve UI scriptlerini düzenle',
    icon: Palette,
    color: 'cyber-green',
    path: '/ui-tools',
    features: ['Sub Slicer', 'Canlı Önizleme', 'UIScript Editor']
  },
  {
    id: 'log-analyzer',
    title: 'Log Analyzer',
    description: 'Syslog ve syserr dosyalarını anlık takip et',
    icon: Activity,
    color: 'warning',
    path: '/log-analyzer',
    features: ['Gerçek Zamanlı', 'Hata Kategorileri', 'Debug Console']
  }
];

const quickStats = [
  { label: 'Aktif Projeler', value: '3', icon: Server, color: 'cyber-green' },
  { label: 'Toplam Item', value: '1,247', icon: Database, color: 'vivid-blue' },
  { label: 'Quest Sayısı', value: '89', icon: Scroll, color: 'cyber-green' },
  { label: 'Online Oyuncu', value: '127', icon: Users, color: 'warning' }
];

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-dark-surface to-dark-hover rounded-xl p-6 border border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Metin2 Dev Toolkit'e Hoş Geldin! 🚀
            </h1>
            <p className="text-text-secondary">
              Private server geliştirme sürecini hızlandıran modern araçlar
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
                <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
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
                Modülü Aç →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Son Aktiviteler</h2>
        <div className="space-y-3">
          {[
            { action: 'item_proto.txt güncellendi', time: '5 dakika önce', type: 'success' },
            { action: 'Yeni quest oluşturuldu: "Dragon Valley"', time: '12 dakika önce', type: 'info' },
            { action: 'Shop #15 düzenlendi', time: '1 saat önce', type: 'warning' },
            { action: 'Database bağlantısı yenilendi', time: '2 saat önce', type: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-hover transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-success' :
                activity.type === 'warning' ? 'bg-warning' : 'bg-vivid-blue'
              }`} />
              <div className="flex-1">
                <p className="text-text-primary text-sm">{activity.action}</p>
                <p className="text-text-muted text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;