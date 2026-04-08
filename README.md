# Metin2 Dev Toolkit 🚀

Modern ve kapsamlı Metin2 private server geliştirme araçları. Hepsi bir arada masaüstü yönetim paneli.

## ✨ Özellikler

### 🏪 Shop Manager
- **NPC Tabanlı Dükkan Düzenleme**: 3D NPC önizleme ile görsel dükkan editörü
- **Sürükle-Bırak Desteği**: İtemleri kolayca dükkan slotlarına yerleştirin
- **SQL Entegrasyonu**: shop_item tablosu ile otomatik senkronizasyon
- **Gelişmiş Filtreleme**: Item türü, nadirlik ve fiyat bazlı filtreleme

### 📝 Proto Editor
- **Item & Mob Proto**: item_proto ve mob_proto dosyalarını düzenleyin
- **Toplu Güncelleme**: Birden fazla item/mob'u aynı anda güncelleyin
- **SQL/Client Sync**: Database ve client dosyalarını senkronize edin
- **Gelişmiş Filtreleme**: Karmaşık arama ve filtreleme seçenekleri

### 📜 Quest Generator
- **Visual Scripting**: Blok tabanlı görsel quest editörü
- **Lua Export**: Otomatik Lua kodu üretimi
- **Hazır Şablonlar**: Kill, delivery, collection quest şablonları
- **NPC Konuşma Editörü**: Dialog ağaçları ve konuşma akışları

### 🗺️ Map Tool
- **Koordinat Görselleştirme**: Harita üzerinde koordinatları görün
- **Teleport Kodu Üretici**: Otomatik teleport komutları
- **AtlasInfo Yönetimi**: atlasinfo.txt dosyasını otomatik güncelleyin
- **Bölge Editörü**: Harita bölgelerini tanımlayın ve düzenleyin

### 🎨 UI Tools
- **Sub Slicer**: .sub dosyalarını parçalayın ve düzenleyin
- **UIScript Editor**: Python tabanlı UI scriptlerini düzenleyin
- **Canlı Önizleme**: Değişiklikleri anında görün
- **UI Bileşen Editörü**: Window, button, dialog editörleri

### 📊 Log Analyzer
- **Gerçek Zamanlı Takip**: syslog ve syserr dosyalarını canlı izleyin
- **Hata Kategorileri**: Warning, Error, Critical seviye filtreleme
- **Debug Console**: Gelişmiş hata ayıklama araçları
- **İstatistikler**: Log analizi ve performans metrikleri

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + Hooks
- **Desktop**: Electron
- **Styling**: Tailwind CSS + Custom Dark Theme
- **Drag & Drop**: React DnD
- **Database**: MySQL2
- **Icons**: Lucide React

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Primary**: Cyber Green (#00FF7F)
- **Secondary**: Vivid Blue (#0080FF)
- **Background**: Dark (#0F0F0F)
- **Surface**: Dark Surface (#1A1A1A)
- **Accent**: Warning (#FFB800)

### Tipografi
- **Sans**: Inter (UI Text)
- **Mono**: JetBrains Mono (Code/Data)

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+
- npm veya yarn
- MySQL Server

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/username/metin2-dev-toolkit.git
cd metin2-dev-toolkit
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Geliştirme modunda çalıştırın**
```bash
npm run electron-dev
```

4. **Production build**
```bash
npm run build
npm run electron-pack
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Dashboard/          # Ana dashboard
│   ├── Layout/            # Sidebar, TopBar
│   ├── ShopManager/       # Dükkan yönetimi
│   ├── ProtoEditor/       # Proto dosya editörü
│   ├── QuestGenerator/    # Quest oluşturucu
│   ├── MapTool/          # Harita araçları
│   ├── UITools/          # UI editörleri
│   └── LogAnalyzer/      # Log analizi
├── context/              # React Context
├── utils/               # Yardımcı fonksiyonlar
└── styles/             # CSS dosyaları
```

## 🔧 Konfigürasyon

### Database Bağlantısı
```javascript
const config = {
  host: 'localhost',
  port: 3306,
  database: 'metin2',
  username: 'root',
  password: 'your_password'
};
```

### Electron Ayarları
```javascript
// public/electron.js
const mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  minWidth: 1200,
  minHeight: 700,
  // ...diğer ayarlar
});
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🎯 Roadmap

- [ ] **v1.1**: Proto Editor tam implementasyonu
- [ ] **v1.2**: Quest Generator visual scripting
- [ ] **v1.3**: Map Tool harita görselleştirme
- [ ] **v1.4**: UI Tools sub slicer
- [ ] **v1.5**: Log Analyzer gerçek zamanlı takip
- [ ] **v2.0**: Plugin sistemi ve API

## 📞 İletişim

- **GitHub**: [github.com/username/metin2-dev-toolkit](https://github.com/username/metin2-dev-toolkit)
- **Discord**: Metin2 Dev Community
- **Email**: dev@metin2toolkit.com

---

**Metin2 Dev Toolkit** ile private server geliştirme sürecinizi hızlandırın! 🚀