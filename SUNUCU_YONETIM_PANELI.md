# Sunucu Yönetim Paneli - Yeni Özellikler

## 📋 Eklenen Modüller

### 1. **Sunucu Yönetimi** (`/server-manager`)
- ✅ Sunucu başlatma/durdurma/yeniden başlatma
- ✅ Gerçek zamanlı sunucu istatistikleri
  - Oyuncu sayısı
  - Uptime
  - FPS, Memory, CPU
- ✅ Sunucu günlüğü (son 50 işlem)
- ✅ Durum göstergesi (Çevrimiçi/Çevrimdışı)

**Dosya:** `src/components/ServerManager/ServerManager.js`

---

### 2. **Oyuncu Listesi** (`/players`)
- ✅ Tüm oyuncuları listele
- ✅ Arama (ad/ID)
- ✅ Sıralama (Level, Exp, Gold)
- ✅ Oyuncu detayları modal
- ✅ Oyuncu yasaklama
- ✅ Oyuncu silme
- ✅ Otomatik yenileme (10 saniye)

**Dosya:** `src/components/Players/PlayerList.js`

**Tablo Sütunları:**
- Adı
- Level
- Exp
- Gold
- Son Login
- İşlemler (Detay, Yasakla, Sil)

---

### 3. **Quest Editörü** (`/quests`)
- ✅ Quest listesi
- ✅ Yeni quest oluştur
- ✅ Quest düzenle
- ✅ Quest sil
- ✅ Arama (ad/ID)
- ✅ Quest detayları (Level aralığı, Ödüller)

**Dosya:** `src/components/Quests/QuestEditor.js`

**Quest Alanları:**
- Quest Adı
- Açıklama
- Min/Max Level
- Reward Exp
- Reward Gold
- Reward Item (Opsiyonel)

---

### 4. **Query Builder** (`/query-builder`)
- ✅ SQL sorguları yazma ve çalıştırma
- ✅ Sonuçları tablo olarak görüntüleme
- ✅ Kaydedilen sorguları yönetme
- ✅ Sonuçları CSV olarak kopyalama
- ✅ Sonuçları CSV olarak indirme
- ✅ Hata gösterimi

**Dosya:** `src/components/QueryBuilder/QueryBuilder.js`

**Özellikler:**
- Kaydedilen sorguları sidebar'da göster
- Hızlı yükleme
- Sonuçları export et

---

## 🔧 Electron IPC Handlers

Aşağıdaki yeni IPC handlers `public/electron.js`'e eklendi:

### Sunucu Yönetimi
```javascript
ipcMain.handle('start-server', ...)      // Sunucu başlat
ipcMain.handle('stop-server', ...)       // Sunucu durdur
```

### Oyuncu Yönetimi
```javascript
ipcMain.handle('get-players', ...)       // Oyuncu listesi
ipcMain.handle('delete-player', ...)     // Oyuncu sil
ipcMain.handle('ban-player', ...)        // Oyuncu yasakla
```

### Quest Yönetimi
```javascript
ipcMain.handle('get-quests', ...)        // Quest listesi
ipcMain.handle('create-quest', ...)      // Yeni quest
ipcMain.handle('update-quest', ...)      // Quest güncelle
ipcMain.handle('delete-quest', ...)      // Quest sil
```

---

## 🗂️ Dosya Yapısı

```
src/components/
├── ServerManager/
│   └── ServerManager.js          (Sunucu yönetimi)
├── Players/
│   └── PlayerList.js             (Oyuncu listesi)
├── Quests/
│   └── QuestEditor.js            (Quest editörü)
└── QueryBuilder/
    └── QueryBuilder.js           (Query builder)
```

---

## 🌐 Dil Desteği

Tüm yeni modüller Türkçe ve İngilizce dillerini destekler.

**Eklenen çeviriler:**
- `server_manager`: "Sunucu Yönetimi"
- `players`: "Oyuncular"
- `quests`: "Questler"
- `query_builder`: "Query Builder"

---

## 📱 Sidebar Navigasyonu

Sidebar'a 4 yeni menü öğesi eklendi:

1. 🖥️ **Sunucu Yönetimi** → `/server-manager`
2. 👥 **Oyuncular** → `/players`
3. 📖 **Questler** → `/quests`
4. 🔍 **Query Builder** → `/query-builder`

---

## 🚀 Kullanım

### Sunucu Yönetimi
1. Sidebar'dan "Sunucu Yönetimi" seç
2. Başlat/Durdur/Yeniden Başlat butonlarını kullan
3. Gerçek zamanlı istatistikleri izle
4. Günlüğü kontrol et

### Oyuncu Yönetimi
1. Sidebar'dan "Oyuncular" seç
2. Oyuncu adı veya ID ile ara
3. Sıralama seçeneğini değiştir
4. Detayları görüntüle, yasakla veya sil

### Quest Yönetimi
1. Sidebar'dan "Questler" seç
2. "Yeni Quest" butonuna tıkla
3. Quest bilgilerini doldur
4. Kaydet veya Düzenle

### Query Builder
1. Sidebar'dan "Query Builder" seç
2. SQL sorgusu yaz
3. "Çalıştır" butonuna tıkla
4. Sonuçları görüntüle, kopyala veya indir

---

## 💾 Veri Depolama

- **Kaydedilen Sorgular:** `localStorage` (Query Builder)
- **Konfigürasyon:** `~/.metin2-toolkit/config.json`
- **Dil Seçimi:** `localStorage`

---

## 🔐 Güvenlik Notları

- Oyuncu silme işlemi onay gerektirir
- Quest silme işlemi onay gerektirir
- SQL sorguları doğrudan çalıştırılır (dikkatli kullanın)
- Tüm işlemler database bağlantısı gerektirir

---

## 📊 Veritabanı Tabloları

Aşağıdaki tablolar varsayılmaktadır:

- `player` - Oyuncu bilgileri
- `quest` - Quest bilgileri
- `shop` - Dükkan bilgileri
- `shop_item` - Dükkan öğeleri
- `item_proto` - Item prototipleri

---

## 🎨 Tema

Tüm yeni modüller Metin2 Dev Toolkit temasını kullanır:
- Koyu arka plan (#0F0F0F)
- Cyber yeşil vurgu (#00FF7F)
- Vivid mavi (#0080FF)

---

## 📝 Notlar

- Sunucu başlatma/durdurma şu anda placeholder'dır (gerçek sunucu kontrol kodu eklenebilir)
- Oyuncu ve Quest işlemleri gerçek veritabanı işlemleridir
- Query Builder kaydedilen sorguları localStorage'da tutar
- Tüm modüller responsive tasarımdır

---

**Versiyon:** 1.3.0  
**Tarih:** 2024  
**Durum:** ✅ Tamamlandı
